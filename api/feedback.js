const crypto = require("node:crypto");
const { getFirestore } = require("../server/firestore-client");
const { cleanText, getAccountFromRequest, getBearerToken } = require("../server/auth-utils");
const { setCors } = require("../server/cors-utils");
const { checkRateLimit, recordRateLimitAttempt } = require("../server/rate-limit");

const FEEDBACK_COLLECTION = "randomChoiceFeedback";
const FEEDBACK_TYPES = new Set(["Bug / 错误", "功能建议", "UI 不好用", "内容错误", "其他"]);
const CORS_OPTIONS = {
  methods: ["POST", "OPTIONS"],
};
const FEEDBACK_RATE_LIMIT = {
  name: "feedback",
  max: 8,
  devMax: 40,
  windowMs: 15 * 60 * 1000,
  devWindowMs: 15 * 60 * 1000,
  maxEnv: "FEEDBACK_RATE_LIMIT_MAX",
  windowEnv: "FEEDBACK_RATE_LIMIT_WINDOW_MS",
};

function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  return request.body || {};
}

function cleanFeedbackText(value, maxLength) {
  return cleanText(redactSensitiveText(value), maxLength);
}

function redactSensitiveText(value) {
  return String(value || "")
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/gi, "[redacted private key]")
    .replace(/([?&](?:auth[_-]?token|token|password|private[_-]?key|api[_-]?key|gcp[_-]?key)=)[^&#\s]*/gi, "$1[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, "Bearer [redacted token]")
    .replace(/\b(password|passcode|token|private[_\s-]?key|api[_\s-]?key)\s*[:=]\s*\S+/gi, "$1=[redacted]");
}

function normalizeFeedbackType(type) {
  const normalized = cleanText(type, 30);
  return FEEDBACK_TYPES.has(normalized) ? normalized : "其他";
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
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

function createHttpError(statusCode, error, detail = error) {
  const httpError = new Error(detail);
  httpError.statusCode = statusCode;
  httpError.publicError = error;
  return httpError;
}

function cleanFeedback(body, account) {
  const title = cleanFeedbackText(body.title, 80);
  const message = cleanFeedbackText(body.message, 1000);
  const now = new Date().toISOString();

  if (!title) {
    throw createHttpError(400, "Feedback title is required");
  }

  if (!message) {
    throw createHttpError(400, "Feedback message is required");
  }

  return {
    id: `${Date.now()}-${crypto.randomUUID()}`,
    type: normalizeFeedbackType(body.type),
    title,
    message,
    contact: cleanFeedbackText(body.contact, 160),
    pageMode: cleanFeedbackText(body.pageMode, 80),
    url: cleanFeedbackText(body.url, 1200),
    userAgent: cleanFeedbackText(body.userAgent, 500),
    screenWidth: normalizeNumber(body.screenWidth),
    screenHeight: normalizeNumber(body.screenHeight),
    userId: cleanFeedbackText(body.userId, 120),
    accountId: account?.id || "",
    username: account?.username || "",
    status: "new",
    priority: "untriaged",
    createdAt: now,
  };
}

module.exports = async function handler(request, response) {
  setCors(request, response, CORS_OPTIONS);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const rateLimit = checkRateLimit(request, response, FEEDBACK_RATE_LIMIT);

    if (!rateLimit.allowed) {
      response.status(429).json({ ok: false, error: "反馈提交太频繁了，等一下再试" });
      return;
    }

    recordRateLimitAttempt(rateLimit);
    const account = await getOptionalAccount(request);
    const feedback = cleanFeedback(parseBody(request), account);
    await getFirestore().collection(FEEDBACK_COLLECTION).doc(feedback.id).set(feedback);

    response.status(201).json({
      ok: true,
      id: feedback.id,
    });
  } catch (error) {
    if (error.statusCode) {
      response.status(error.statusCode).json({
        ok: false,
        error: error.publicError || error.message,
      });
      return;
    }

    response.status(500).json({
      ok: false,
      error: "Feedback temporarily unavailable",
    });
  }
};
