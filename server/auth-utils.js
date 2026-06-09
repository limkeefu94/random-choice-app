const crypto = require("node:crypto");

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
const USERNAME_PATTERN = /^[\w\u4e00-\u9fa5-]{2,20}$/u;
const DEFAULT_PRIVACY = Object.freeze({
  discoverable: false,
  showOnlineStatus: false,
  allowFriendRequests: false,
  allowDirectMessages: "friendsOnly",
});
const DEFAULT_WORLD_PREFERENCES = Object.freeze({
  language: "zh-CN",
  region: "global",
  topics: [],
  hideLottery: false,
});
const DEFAULT_ACCOUNT_SETTINGS = Object.freeze({
  privacy: Object.freeze({
    discoverable: true,
    allowFriendRequests: true,
    allowDirectMessages: "friendsOnly",
    showOnlineStatus: false,
    hideLotteryContent: false,
  }),
  preferences: Object.freeze({
    language: "zh-CN",
    currency: "MYR",
    worldRegion: "MY",
    worldTopics: Object.freeze(["general"]),
  }),
});
const DIRECT_MESSAGE_POLICIES = new Set(["friendsOnly", "everyone", "none"]);

function isProductionAppEnv() {
  return String(process.env.APP_ENV || "").toLowerCase() === "production";
}

function getAuthSecret() {
  if (process.env.AUTH_TOKEN_SECRET) {
    return process.env.AUTH_TOKEN_SECRET;
  }

  if (isProductionAppEnv()) {
    throw new Error("Missing AUTH_TOKEN_SECRET in production");
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
  const headers = request.headers || {};
  const header = headers.authorization || headers.Authorization || "";
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
  return Array.from(String(name || "游").trim())[0]?.toUpperCase() || "游";
}

function normalizeAvatar(value, fallbackName) {
  return cleanText(value, 2) || getAvatarText(fallbackName);
}

function normalizeBooleanSetting(value, fallback) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

function normalizePrivacy(privacy) {
  const source = privacy && typeof privacy === "object" ? privacy : {};
  const allowDirectMessages = DIRECT_MESSAGE_POLICIES.has(source.allowDirectMessages)
    ? source.allowDirectMessages
    : DEFAULT_PRIVACY.allowDirectMessages;

  return {
    discoverable: normalizeBooleanSetting(source.discoverable, DEFAULT_PRIVACY.discoverable),
    showOnlineStatus: normalizeBooleanSetting(source.showOnlineStatus, DEFAULT_PRIVACY.showOnlineStatus),
    allowFriendRequests: normalizeBooleanSetting(source.allowFriendRequests, DEFAULT_PRIVACY.allowFriendRequests),
    allowDirectMessages,
  };
}

function normalizeWorldPreferences(worldPreferences) {
  const source = worldPreferences && typeof worldPreferences === "object" ? worldPreferences : {};
  const topics = Array.isArray(source.topics)
    ? [...new Set(source.topics.map((topic) => cleanText(topic, 40)).filter(Boolean))].slice(0, 12)
    : [...DEFAULT_WORLD_PREFERENCES.topics];

  return {
    language: cleanText(source.language, 20) || DEFAULT_WORLD_PREFERENCES.language,
    region: cleanText(source.region, 60) || DEFAULT_WORLD_PREFERENCES.region,
    topics,
    hideLottery: normalizeBooleanSetting(source.hideLottery, DEFAULT_WORLD_PREFERENCES.hideLottery),
  };
}

function normalizeSettings(settings) {
  const source = settings && typeof settings === "object" ? settings : {};
  const privacySource = source.privacy && typeof source.privacy === "object" ? source.privacy : {};
  const preferenceSource = source.preferences && typeof source.preferences === "object" ? source.preferences : {};
  const allowDirectMessages = DIRECT_MESSAGE_POLICIES.has(privacySource.allowDirectMessages)
    ? privacySource.allowDirectMessages
    : DEFAULT_ACCOUNT_SETTINGS.privacy.allowDirectMessages;
  const worldTopics = Array.isArray(preferenceSource.worldTopics)
    ? [...new Set(preferenceSource.worldTopics.map((topic) => cleanText(topic, 40)).filter(Boolean))].slice(0, 12)
    : [...DEFAULT_ACCOUNT_SETTINGS.preferences.worldTopics];

  return {
    privacy: {
      discoverable: normalizeBooleanSetting(privacySource.discoverable, DEFAULT_ACCOUNT_SETTINGS.privacy.discoverable),
      allowFriendRequests: normalizeBooleanSetting(privacySource.allowFriendRequests, DEFAULT_ACCOUNT_SETTINGS.privacy.allowFriendRequests),
      allowDirectMessages,
      showOnlineStatus: normalizeBooleanSetting(privacySource.showOnlineStatus, DEFAULT_ACCOUNT_SETTINGS.privacy.showOnlineStatus),
      hideLotteryContent: normalizeBooleanSetting(privacySource.hideLotteryContent, DEFAULT_ACCOUNT_SETTINGS.privacy.hideLotteryContent),
    },
    preferences: {
      language: cleanText(preferenceSource.language, 20) || DEFAULT_ACCOUNT_SETTINGS.preferences.language,
      currency: cleanText(preferenceSource.currency, 12) || DEFAULT_ACCOUNT_SETTINGS.preferences.currency,
      worldRegion: cleanText(preferenceSource.worldRegion, 60) || DEFAULT_ACCOUNT_SETTINGS.preferences.worldRegion,
      worldTopics,
    },
  };
}

function withAccountSocialDefaults(account) {
  const source = account && typeof account === "object" ? account : {};
  const displayName = source.displayName || source.username;
  const settings = normalizeSettings(source.settings);

  return {
    ...source,
    displayName,
    avatar: normalizeAvatar("", displayName || source.username),
    settings,
    privacy: normalizePrivacy(source.privacy),
    worldPreferences: normalizeWorldPreferences(source.worldPreferences),
  };
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
  const normalizedAccount = withAccountSocialDefaults(account);

  return {
    id: normalizedAccount.id,
    username: normalizedAccount.username,
    displayName: normalizedAccount.displayName || normalizedAccount.username,
    avatar: normalizeAvatar("", normalizedAccount.displayName || normalizedAccount.username),
    avatarUrl: cleanText(normalizedAccount.avatarUrl, 1200),
    userId: normalizedAccount.userId,
    settings: normalizedAccount.settings,
    privacy: normalizedAccount.privacy,
    worldPreferences: normalizedAccount.worldPreferences,
    createdAt: normalizedAccount.createdAt,
    updatedAt: normalizedAccount.updatedAt,
  };
}

async function getAccountById(accountId) {
  const { getFirestore } = require("./firestore-client");
  const snapshot = await getFirestore().collection("randomChoiceAccounts").doc(accountId).get();

  if (!snapshot.exists) {
    return null;
  }

  return withAccountSocialDefaults({
    id: snapshot.id,
    ...snapshot.data(),
  });
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
  DEFAULT_PRIVACY,
  DEFAULT_WORLD_PREFERENCES,
  DEFAULT_ACCOUNT_SETTINGS,
  getAccountById,
  getAccountFromRequest,
  getBearerToken,
  getUsernameKey,
  isValidUsername,
  normalizeAvatar,
  normalizePrivacy,
  normalizeSettings,
  normalizeUsername,
  normalizeWorldPreferences,
  publicAccount,
  verifyPassword,
  withAccountSocialDefaults,
};
