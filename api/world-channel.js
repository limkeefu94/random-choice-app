const crypto = require("node:crypto");
const { getFirestore } = require("../server/firestore-client");
const { cleanText, getAccountFromRequest, getBearerToken, normalizeAvatar } = require("../server/auth-utils");
const { setCors } = require("../server/cors-utils");
const { checkRateLimit, recordRateLimitAttempt } = require("../server/rate-limit");

const WORLD_COLLECTION = "randomChoiceWorldMessages";
const BLOCK_COLLECTION = "randomChoiceBlocks";
const MAX_WORLD_MESSAGES = 80;
const CORS_OPTIONS = {
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
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

function normalizeLikeAccountIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => cleanText(item, 160)).filter(Boolean))].slice(0, 1000);
}

function normalizeLikeCount(value, likedBy = []) {
  const count = Number(value);

  if (Number.isFinite(count)) {
    return Math.max(Math.floor(count), 0);
  }

  return normalizeLikeAccountIds(likedBy).length;
}

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

function toWorldMessage(documentSnapshot, viewerAccountId = "") {
  const data = documentSnapshot.data() || {};
  const likedBy = normalizeLikeAccountIds(data.likedBy);
  const likeCount = normalizeLikeCount(data.likeCount, likedBy);
  const safeViewerAccountId = cleanText(viewerAccountId, 160);

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
    updatedAt: data.updatedAt || "",
    time: data.time || "",
    likeCount,
    likedByCurrentUser: Boolean(safeViewerAccountId && likedBy.includes(safeViewerAccountId)),
    isDeleted: data.isDeleted === true,
    deletedAt: data.deletedAt || "",
  };
}

function isDeletedWorldMessage(message) {
  return message?.isDeleted === true || Boolean(message?.deletedAt);
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
  const limit = getLimit(request);
  const shouldReadMine = ["1", "true", "yes"].includes(String(getQueryParam(request, "mine") || "").toLowerCase());

  if (shouldReadMine) {
    const account = await getAccountFromRequest(request);
    const snapshot = await getFirestore()
      .collection(WORLD_COLLECTION)
      .where("accountId", "==", account.id)
      .limit(Math.min(Math.max(limit * 4, 40), 200))
      .get();
    const messages = snapshot.docs
      .map((documentSnapshot) => toWorldMessage(documentSnapshot, account.id))
      .filter((message) => !isDeletedWorldMessage(message))
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
      .slice(0, limit);

    response.status(200).json({
      ok: true,
      messages,
    });
    return;
  }

  const account = await getOptionalAccount(request);
  const blockedAccountIds = await getBlockedAccountIds(account?.id);
  const snapshot = await getFirestore()
    .collection(WORLD_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(Math.min(limit * 2, MAX_WORLD_MESSAGES))
    .get();
  const messages = snapshot.docs
    .map((documentSnapshot) => toWorldMessage(documentSnapshot, account?.id))
    .filter((message) => !isDeletedWorldMessage(message))
    .filter((message) => !blockedAccountIds.has(message.accountId))
    .slice(0, limit)
    .reverse();

  response.status(200).json({
    ok: true,
    messages,
  });
}

function getWorldMessageId(request, body) {
  const messageId = cleanText(body.id || body.messageId || getQueryParam(request, "id") || getQueryParam(request, "messageId"), 160);

  if (!/^[a-z0-9:_-]{6,180}$/i.test(messageId)) {
    return "";
  }

  return messageId;
}

async function getOwnedWorldMessage(request, response, body) {
  const account = await getAccountFromRequest(request);
  const messageId = getWorldMessageId(request, body);

  if (!messageId) {
    response.status(400).json({ ok: false, error: "找不到要处理的内容" });
    return null;
  }

  const documentRef = getFirestore().collection(WORLD_COLLECTION).doc(messageId);
  const snapshot = await documentRef.get();

  if (!snapshot.exists) {
    response.status(404).json({ ok: false, error: "这条内容不存在" });
    return null;
  }

  const data = snapshot.data() || {};

  if (data.accountId !== account.id) {
    response.status(403).json({ ok: false, error: "只能管理自己发布的内容" });
    return null;
  }

  if (data.isDeleted === true || data.deletedAt) {
    response.status(409).json({ ok: false, error: "这条内容已经移除" });
    return null;
  }

  return {
    account,
    documentRef,
    snapshot,
  };
}

async function updateWorldMessage(request, response) {
  const body = parseBody(request);
  const ownedMessage = await getOwnedWorldMessage(request, response, body);

  if (!ownedMessage) {
    return;
  }

  const text = cleanText(body.text, 220);

  if (!text) {
    response.status(400).json({ ok: false, error: "文字内容不能为空" });
    return;
  }

  const updatedAt = new Date().toISOString();
  await ownedMessage.documentRef.update({
    text,
    updatedAt,
  });

  const updatedSnapshot = await ownedMessage.documentRef.get();

  response.status(200).json({
    ok: true,
    message: toWorldMessage(updatedSnapshot, ownedMessage.account.id),
  });
}

async function toggleWorldMessageLike(request, response, body) {
  const account = await getAccountFromRequest(request);
  const messageId = getWorldMessageId(request, body);

  if (!messageId) {
    response.status(400).json({ ok: false, error: "找不到要点爱心的内容" });
    return;
  }

  const documentRef = getFirestore().collection(WORLD_COLLECTION).doc(messageId);

  await getFirestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(documentRef);

    if (!snapshot.exists) {
      const error = new Error("这条内容不存在");
      error.statusCode = 404;
      throw error;
    }

    const data = snapshot.data() || {};

    if (data.isDeleted === true || data.deletedAt) {
      const error = new Error("这条内容已经移除");
      error.statusCode = 409;
      throw error;
    }

    const likedBy = new Set(normalizeLikeAccountIds(data.likedBy));

    if (likedBy.has(account.id)) {
      likedBy.delete(account.id);
    } else {
      likedBy.add(account.id);
    }

    const nextLikedBy = [...likedBy];
    transaction.update(documentRef, {
      likedBy: nextLikedBy,
      likeCount: nextLikedBy.length,
      likeUpdatedAt: new Date().toISOString(),
    });
  });

  const updatedSnapshot = await documentRef.get();
  const updatedMessage = toWorldMessage(updatedSnapshot, account.id);

  response.status(200).json({
    ok: true,
    message: updatedMessage,
    likeCount: updatedMessage.likeCount,
    likedByCurrentUser: updatedMessage.likedByCurrentUser,
  });
}

async function deleteWorldMessage(request, response) {
  const body = parseBody(request);
  const ownedMessage = await getOwnedWorldMessage(request, response, body);

  if (!ownedMessage) {
    return;
  }

  const deletedAt = new Date().toISOString();
  await ownedMessage.documentRef.update({
    isDeleted: true,
    deletedAt,
    deletedBy: ownedMessage.account.id,
    updatedAt: deletedAt,
  });

  response.status(200).json({
    ok: true,
    id: ownedMessage.snapshot.id,
    deletedAt,
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

    if (request.method === "PATCH") {
      const body = parseBody(request);

      if (cleanText(body.action, 40) === "toggleLike") {
        await toggleWorldMessageLike(request, response, body);
        return;
      }

      await updateWorldMessage(request, response);
      return;
    }

    if (request.method === "DELETE") {
      await deleteWorldMessage(request, response);
      return;
    }

    response.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (error) {
    const needsLogin = error.message === "Invalid token" || error.message === "Expired token" || error.message === "Account not found";

    const statusCode = error.statusCode || (needsLogin ? 401 : 500);

    response.status(statusCode).json({
      ok: false,
      error: error.statusCode ? error.message : needsLogin ? "请重新登入" : "世界频道暂时连不上",
      detail: error.message,
    });
  }
};
