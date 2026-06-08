const crypto = require("node:crypto");
const { getFirestore } = require("../server/firestore-client");
const { cleanText, getAccountFromRequest, getBearerToken, normalizeAvatar } = require("../server/auth-utils");
const { setCors } = require("../server/cors-utils");
const { checkRateLimit, recordRateLimitAttempt } = require("../server/rate-limit");

const WORLD_COLLECTION = "randomChoiceWorldMessages";
const BLOCK_COLLECTION = "randomChoiceBlocks";
const MAX_WORLD_MESSAGES = 80;
const CORS_OPTIONS = {
  methods: ["GET", "POST", "OPTIONS"],
};
const WORLD_MESSAGE_10_SECOND_LIMIT = {
  name: "world-message-10s",
  max: 1,
  devMax: 1,
  windowMs: 10 * 1000,
  devWindowMs: 10 * 1000,
  maxEnv: "WORLD_MESSAGE_10S_RATE_LIMIT_MAX",
  windowEnv: "WORLD_MESSAGE_10S_RATE_LIMIT_WINDOW_MS",
};
const WORLD_MESSAGE_MINUTE_LIMIT = {
  name: "world-message-1m",
  max: 6,
  devMax: 6,
  windowMs: 60 * 1000,
  devWindowMs: 60 * 1000,
  maxEnv: "WORLD_MESSAGE_MINUTE_RATE_LIMIT_MAX",
  windowEnv: "WORLD_MESSAGE_MINUTE_RATE_LIMIT_WINDOW_MS",
};
const WORLD_IMAGE_MINUTE_LIMIT = {
  name: "world-image-1m",
  max: 2,
  devMax: 2,
  windowMs: 60 * 1000,
  devWindowMs: 60 * 1000,
  maxEnv: "WORLD_IMAGE_MINUTE_RATE_LIMIT_MAX",
  windowEnv: "WORLD_IMAGE_MINUTE_RATE_LIMIT_WINDOW_MS",
};

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

function getLimit(request) {
  const limit = Number.parseInt(getQueryParam(request, "limit"), 10);

  if (!Number.isFinite(limit)) {
    return 40;
  }

  return Math.min(Math.max(limit, 1), MAX_WORLD_MESSAGES);
}

function normalizeChannelValue(value, fallback, maxLength = 40) {
  const text = cleanText(value, maxLength);
  return /^[a-z0-9_-]{2,40}$/i.test(text) ? text : fallback;
}

function cleanAttachment(attachment) {
  if (!attachment || attachment.type !== "image") {
    return null;
  }

  const url = cleanText(attachment.url || attachment.publicUrl, 1200);
  const publicUrl = cleanText(attachment.publicUrl || url, 1200);
  const filePath = cleanText(attachment.filePath || attachment.objectName, 500);
  const objectName = cleanText(attachment.objectName || attachment.filePath, 500);

  if (!url || !isAllowedGcsAttachment(url, publicUrl, filePath || objectName)) {
    return null;
  }

  return {
    type: "image",
    url,
    publicUrl,
    filePath,
    objectName,
    contentType: cleanText(attachment.contentType, 80),
  };
}

function isAllowedGcsAttachment(url, publicUrl, objectName) {
  if (!objectName || !objectName.startsWith("world/")) {
    return false;
  }

  const bucketName = process.env.GCS_BUCKET_NAME;

  if (!bucketName) {
    return true;
  }

  return [url, publicUrl].filter(Boolean).some((value) => {
    try {
      const parsedUrl = new URL(value);
      const decodedPath = decodeURIComponent(parsedUrl.pathname);
      return parsedUrl.protocol === "https:" && parsedUrl.hostname === "storage.googleapis.com" && decodedPath === `/${bucketName}/${objectName}`;
    } catch {
      return false;
    }
  });
}

function toWorldMessage(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: data.id || documentSnapshot.id,
    channelId: data.channelId || "world",
    topic: data.topic || "general",
    language: data.language || "zh-CN",
    region: data.region || "global",
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

async function getOptionalAccount(request) {
  if (!getBearerToken(request)) {
    return null;
  }

  try {
    return await getAccountFromRequest(request);
  } catch {
    return null;
  }
}

async function getBlockedAccountIds(accountId) {
  if (!accountId) {
    return new Set();
  }

  const snapshot = await getFirestore()
    .collection(BLOCK_COLLECTION)
    .where("blockerAccountId", "==", accountId)
    .limit(500)
    .get();

  return new Set(snapshot.docs.map((documentSnapshot) => documentSnapshot.data()?.blockedAccountId).filter(Boolean));
}

async function readWorldMessages(request, response) {
  const account = await getOptionalAccount(request);
  const blockedAccountIds = await getBlockedAccountIds(account?.id);
  const snapshot = await getFirestore()
    .collection(WORLD_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(getLimit(request))
    .get();
  const messages = snapshot.docs
    .map(toWorldMessage)
    .filter((message) => !blockedAccountIds.has(message.accountId))
    .reverse();

  response.status(200).json({
    ok: true,
    messages,
  });
}

function checkWorldMessageRateLimits(request, response, account, hasImage) {
  const key = account.id;
  const checks = [
    checkRateLimit(request, response, { ...WORLD_MESSAGE_10_SECOND_LIMIT, key }),
    checkRateLimit(request, response, { ...WORLD_MESSAGE_MINUTE_LIMIT, key }),
  ];

  if (hasImage) {
    checks.push(checkRateLimit(request, response, { ...WORLD_IMAGE_MINUTE_LIMIT, key }));
  }

  const blockedCheck = checks.find((check) => !check.allowed);

  if (blockedCheck) {
    return blockedCheck;
  }

  checks.forEach(recordRateLimitAttempt);
  return { allowed: true };
}

async function writeWorldMessage(request, response) {
  const account = await getAccountFromRequest(request);
  const body = parseBody(request);
  const text = cleanText(body.text, 220);
  const attachment = cleanAttachment(body.attachment);
  const channelId = normalizeChannelValue(body.channelId, "world");
  const topic = normalizeChannelValue(body.topic, "general");
  const language = normalizeChannelValue(body.language, "zh-CN", 20);
  const region = normalizeChannelValue(body.region, "global", 40);

  if (!text && !attachment) {
    response.status(400).json({ ok: false, error: "请先写一句话或选择图片" });
    return;
  }

  const rateLimit = checkWorldMessageRateLimits(request, response, account, Boolean(attachment));

  if (!rateLimit.allowed) {
    response.status(429).json({
      ok: false,
      error: "发送太快了，请稍后再试",
    });
    return;
  }

  const now = new Date();
  const message = {
    id: `${now.getTime()}-${crypto.randomUUID()}`,
    channelId,
    topic,
    language,
    region,
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
  setCors(request, response, CORS_OPTIONS);

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
