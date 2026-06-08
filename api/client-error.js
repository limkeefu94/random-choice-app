const crypto = require("node:crypto");
const { getFirestore } = require("./firestore-client");
const { cleanText, getAccountFromRequest, getBearerToken } = require("./auth-utils");
const { setCors } = require("./cors-utils");

const CLIENT_ERROR_COLLECTION = "randomChoiceClientErrors";
const CORS_OPTIONS = {
  methods: ["POST", "OPTIONS"],
};

function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  return request.body || {};
}

function redactSensitiveText(value) {
  return String(value || "")
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/gi, "[redacted private key]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, "Bearer [redacted token]")
    .replace(/\b(password|passcode|token|private[_\s-]?key|api[_\s-]?key|gcp[_\s-]?key)\s*[:=]\s*\S+/gi, "$1=[redacted]");
}

function cleanErrorText(value, maxLength) {
  return cleanText(redactSensitiveText(value), maxLength);
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

function cleanClientError(body, account) {
  const now = new Date().toISOString();

  return {
    id: `${Date.now()}-${crypto.randomUUID()}`,
    message: cleanErrorText(body.message || "Unknown client error", 500),
    stack: cleanErrorText(body.stack, 4000),
    source: cleanErrorText(body.source, 500),
    line: normalizeNumber(body.line),
    column: normalizeNumber(body.column),
    type: cleanErrorText(body.type || "client-error", 80),
    url: cleanErrorText(body.url, 1200),
    pageMode: cleanErrorText(body.pageMode, 80),
    userAgent: cleanErrorText(body.userAgent, 500),
    screenWidth: normalizeNumber(body.screenWidth),
    screenHeight: normalizeNumber(body.screenHeight),
    accountId: account?.id || "",
    username: account?.username || "",
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
    const account = await getOptionalAccount(request);
    const clientError = cleanClientError(parseBody(request), account);
    await getFirestore().collection(CLIENT_ERROR_COLLECTION).doc(clientError.id).set(clientError);

    response.status(201).json({
      ok: true,
      id: clientError.id,
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: "Client error report temporarily unavailable",
      detail: error.message,
    });
  }
};
