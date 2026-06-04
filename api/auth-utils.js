const crypto = require("node:crypto");

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
const USERNAME_PATTERN = /^[\w\u4e00-\u9fa5-]{2,20}$/u;

function getAuthSecret() {
  if (process.env.AUTH_TOKEN_SECRET) {
    return process.env.AUTH_TOKEN_SECRET;
  }

  if (process.env.GCS_SERVICE_ACCOUNT_JSON_BASE64) {
    const jsonText = Buffer.from(process.env.GCS_SERVICE_ACCOUNT_JSON_BASE64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(jsonText);

    if (serviceAccount.private_key) {
      return serviceAccount.private_key;
    }
  }

  const privateKey = process.env.GCS_PRIVATE_KEY || process.env.GCP_PRIVATE_KEY;

  if (privateKey) {
    return privateKey.replace(/\\n/g, "\n");
  }

  throw new Error("Missing AUTH_TOKEN_SECRET");
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function signTokenPart(value) {
  return base64UrlEncode(
    crypto
      .createHmac("sha256", getAuthSecret())
      .update(value)
      .digest(),
  );
}

function createAuthToken(account) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(JSON.stringify({
    sub: account.id,
    username: account.username,
    userId: account.userId,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  }));
  const signature = signTokenPart(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

function verifyAuthToken(token) {
  const [header, payload, signature] = String(token || "").split(".");

  if (!header || !payload || !signature) {
    throw new Error("Invalid token");
  }

  const expectedSignature = signTokenPart(`${header}.${payload}`);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token");
  }

  let data;

  try {
    data = JSON.parse(base64UrlDecode(payload));
  } catch {
    throw new Error("Invalid token");
  }

  if (!data.sub || !data.exp || data.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Expired token");
  }

  return data;
}

function getBearerToken(request) {
  const header = request.headers.authorization || request.headers.Authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : "";
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeUsername(username) {
  return String(username || "").trim();
}

function getUsernameKey(username) {
  return normalizeUsername(username).toLocaleLowerCase("zh-CN");
}

function isValidUsername(username) {
  return USERNAME_PATTERN.test(normalizeUsername(username));
}

function cleanDisplayName(displayName, fallback) {
  return cleanText(displayName || fallback, 20) || fallback;
}

function getAvatarText(name) {
  return String(name || "游").trim().slice(0, 1).toUpperCase() || "游";
}

function normalizeAvatar(value, fallbackName) {
  return cleanText(value, 2) || getAvatarText(fallbackName);
}

function createCloudUserId() {
  return `anon_${Date.now().toString(36)}_${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`;
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString("base64");
  const passwordHash = crypto.scryptSync(String(password), salt, 64).toString("base64");

  return {
    passwordSalt: salt,
    passwordHash: `scrypt:${passwordHash}`,
  };
}

function verifyPassword(account, password) {
  const storedHash = String(account.passwordHash || "");
  const salt = String(account.passwordSalt || "");

  if (!storedHash.startsWith("scrypt:") || !salt) {
    return false;
  }

  const expected = Buffer.from(storedHash.slice("scrypt:".length), "base64");
  const received = crypto.scryptSync(String(password || ""), salt, expected.length);

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

function publicAccount(account) {
  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName || account.username,
    avatar: normalizeAvatar(account.avatar, account.displayName || account.username),
    avatarUrl: cleanText(account.avatarUrl, 1200),
    userId: account.userId,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

async function getAccountById(accountId) {
  const { getFirestore } = require("./firestore-client");
  const snapshot = await getFirestore().collection("randomChoiceAccounts").doc(accountId).get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

async function getAccountFromRequest(request) {
  const token = getBearerToken(request);
  const payload = verifyAuthToken(token);
  const account = await getAccountById(payload.sub);

  if (!account) {
    throw new Error("Account not found");
  }

  return account;
}

module.exports = {
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
};
