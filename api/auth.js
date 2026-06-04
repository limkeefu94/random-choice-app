const crypto = require("node:crypto");
const { getFirestore } = require("./firestore-client");
const {
  cleanDisplayName,
  cleanText,
  createAuthToken,
  createCloudUserId,
  createPasswordRecord,
  getAccountFromRequest,
  getUsernameKey,
  isValidUsername,
  normalizeAvatar,
  normalizeUsername,
  publicAccount,
  verifyPassword,
} = require("./auth-utils");

function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  return request.body || {};
}

function setCors(response) {
  const allowedOrigin = process.env.GCS_ALLOWED_ORIGIN || "*";
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

function sendAuthResponse(response, account, status = 200, token = createAuthToken(account)) {
  response.status(status).json({
    ok: true,
    token,
    user: publicAccount(account),
  });
}

async function registerAccount(request, response) {
  const body = parseBody(request);
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!isValidUsername(username)) {
    response.status(400).json({ ok: false, error: "用户名需要 2-20 个字，只能包含中文、英文、数字、_ 或 -" });
    return;
  }

  if (password.length < 6) {
    response.status(400).json({ ok: false, error: "密码至少需要 6 个字符" });
    return;
  }

  if (password !== confirmPassword) {
    response.status(400).json({ ok: false, error: "两次输入的密码不一样" });
    return;
  }

  const db = getFirestore();
  const accountId = crypto.randomUUID();
  const usernameKey = getUsernameKey(username);
  const now = new Date().toISOString();
  const account = {
    id: accountId,
    username,
    usernameKey,
    displayName: username,
    avatar: normalizeAvatar("", username),
    avatarUrl: "",
    userId: createCloudUserId(),
    ...createPasswordRecord(password),
    createdAt: now,
    updatedAt: now,
  };
  const token = createAuthToken(account);

  try {
    await db.runTransaction(async (transaction) => {
      const usernameRef = db.collection("randomChoiceUsernames").doc(usernameKey);
      const accountRef = db.collection("randomChoiceAccounts").doc(accountId);
      const usernameSnapshot = await transaction.get(usernameRef);

      if (usernameSnapshot.exists) {
        throw new Error("USERNAME_EXISTS");
      }

      transaction.set(usernameRef, {
        accountId,
        username,
        createdAt: now,
      });
      transaction.set(accountRef, account);
    });
  } catch (error) {
    if (error.message === "USERNAME_EXISTS") {
      response.status(409).json({ ok: false, error: "这个用户名已经被注册了" });
      return;
    }

    throw error;
  }

  sendAuthResponse(response, account, 201, token);
}

async function loginAccount(request, response) {
  const body = parseBody(request);
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");

  if (!isValidUsername(username)) {
    response.status(400).json({ ok: false, error: "请输入正确的用户名" });
    return;
  }

  const db = getFirestore();
  const usernameSnapshot = await db.collection("randomChoiceUsernames").doc(getUsernameKey(username)).get();

  if (!usernameSnapshot.exists) {
    response.status(401).json({ ok: false, error: "用户名或密码不正确" });
    return;
  }

  const accountSnapshot = await db.collection("randomChoiceAccounts").doc(usernameSnapshot.data().accountId).get();

  if (!accountSnapshot.exists) {
    response.status(401).json({ ok: false, error: "用户名或密码不正确" });
    return;
  }

  const account = {
    id: accountSnapshot.id,
    ...accountSnapshot.data(),
  };

  if (!verifyPassword(account, password)) {
    response.status(401).json({ ok: false, error: "用户名或密码不正确" });
    return;
  }

  sendAuthResponse(response, account);
}

async function getCurrentAccount(request, response) {
  const account = await getAccountFromRequest(request);
  sendAuthResponse(response, account);
}

async function updateProfile(request, response) {
  const account = await getAccountFromRequest(request);
  const body = parseBody(request);
  const displayName = cleanDisplayName(body.displayName, account.username);
  const avatar = normalizeAvatar(body.avatar, displayName);
  const avatarUrl = cleanText(body.avatarUrl || account.avatarUrl, 1200);
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const confirmPassword = String(body.confirmPassword || "");
  const update = {
    displayName,
    avatar,
    avatarUrl,
    updatedAt: new Date().toISOString(),
  };

  if (newPassword || currentPassword || confirmPassword) {
    if (!verifyPassword(account, currentPassword)) {
      response.status(401).json({ ok: false, error: "现在的密码不正确" });
      return;
    }

    if (newPassword.length < 6) {
      response.status(400).json({ ok: false, error: "新密码至少需要 6 个字符" });
      return;
    }

    if (newPassword !== confirmPassword) {
      response.status(400).json({ ok: false, error: "两次输入的新密码不一样" });
      return;
    }

    Object.assign(update, createPasswordRecord(newPassword));
  }

  await getFirestore().collection("randomChoiceAccounts").doc(account.id).set(update, { merge: true });

  sendAuthResponse(response, {
    ...account,
    ...update,
  });
}

module.exports = async function handler(request, response) {
  setCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  try {
    if (request.method === "GET") {
      await getCurrentAccount(request, response);
      return;
    }

    if (request.method === "POST") {
      const body = parseBody(request);
      const action = String(body.action || "").trim();

      if (action === "register") {
        await registerAccount(request, response);
        return;
      }

      if (action === "login") {
        await loginAccount(request, response);
        return;
      }

      if (action === "update-profile") {
        await updateProfile(request, response);
        return;
      }

      response.status(400).json({ ok: false, error: "不支持的账号操作" });
      return;
    }

    response.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (error) {
    const message = error.message === "Invalid token" || error.message === "Expired token" || error.message === "Account not found"
      ? "请重新登入"
      : error.message;
    const status = message === "请重新登入" ? 401 : 500;

    response.status(status).json({
      ok: false,
      error: "账号暂时处理不了",
      detail: message,
    });
  }
};
