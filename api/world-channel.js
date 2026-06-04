const crypto = require("node:crypto");
const { getFirestore } = require("./firestore-client");
const { cleanText, getAccountFromRequest, normalizeAvatar } = require("./auth-utils");

const WORLD_COLLECTION = "randomChoiceWorldMessages";
const MAX_WORLD_MESSAGES = 80;

function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  return request.body || {};
}

function getQueryParam(request, key) {
  if (request.query?.[key]) {
    return request.query[key];
  }

  const requestUrl = new URL(request.url || "/", `https://${request.headers.host || "localhost"}`);
  return requestUrl.searchParams.get(key);
}

function setCors(response) {
  const allowedOrigin = process.env.GCS_ALLOWED_ORIGIN || "*";
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

function getLimit(request) {
  const limit = Number.parseInt(getQueryParam(request, "limit"), 10);

  if (!Number.isFinite(limit)) {
    return 40;
  }

  return Math.min(Math.max(limit, 1), MAX_WORLD_MESSAGES);
}

function cleanAttachment(attachment) {
  if (!attachment || attachment.type !== "image") {
    return null;
  }

  const url = cleanText(attachment.url || attachment.publicUrl, 1200);

  if (!url) {
    return null;
  }

  return {
    type: "image",
    url,
    publicUrl: cleanText(attachment.publicUrl || url, 1200),
    filePath: cleanText(attachment.filePath || attachment.objectName, 500),
    objectName: cleanText(attachment.objectName || attachment.filePath, 500),
    contentType: cleanText(attachment.contentType, 80),
  };
}

function toWorldMessage(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: data.id || documentSnapshot.id,
    accountId: data.accountId || "",
    userId: data.userId || "",
    user: data.user || "游客",
    username: data.username || "",
    avatar: data.avatar || normalizeAvatar("", data.user),
    avatarUrl: data.avatarUrl || "",
    text: data.text || "",
    attachment: data.attachment || null,
    createdAt: data.createdAt || "",
    time: data.time || "",
  };
}

async function readWorldMessages(request, response) {
  const snapshot = await getFirestore()
    .collection(WORLD_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(getLimit(request))
    .get();
  const messages = snapshot.docs.map(toWorldMessage).reverse();

  response.status(200).json({
    ok: true,
    messages,
  });
}

async function writeWorldMessage(request, response) {
  const account = await getAccountFromRequest(request);
  const body = parseBody(request);
  const text = cleanText(body.text, 220);
  const attachment = cleanAttachment(body.attachment);

  if (!text && !attachment) {
    response.status(400).json({ ok: false, error: "请先写一句话或选择图片" });
    return;
  }

  const now = new Date();
  const message = {
    id: `${now.getTime()}-${crypto.randomUUID()}`,
    accountId: account.id,
    userId: account.userId,
    user: account.displayName || account.username,
    username: account.username,
    avatar: normalizeAvatar(account.avatar, account.displayName || account.username),
    avatarUrl: cleanText(account.avatarUrl, 1200),
    text,
    attachment,
    createdAt: now.toISOString(),
    time: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kuala_Lumpur",
    }).format(now),
  };

  await getFirestore().collection(WORLD_COLLECTION).doc(message.id).set(message);

  response.status(201).json({
    ok: true,
    message,
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
      await readWorldMessages(request, response);
      return;
    }

    if (request.method === "POST") {
      await writeWorldMessage(request, response);
      return;
    }

    response.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (error) {
    const needsLogin = error.message === "Invalid token" || error.message === "Expired token" || error.message === "Account not found";

    response.status(needsLogin ? 401 : 500).json({
      ok: false,
      error: needsLogin ? "请重新登入" : "世界频道暂时连不上",
      detail: error.message,
    });
  }
};
