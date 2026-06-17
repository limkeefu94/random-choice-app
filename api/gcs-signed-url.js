const { Storage } = require("@google-cloud/storage");
const crypto = require("node:crypto");
const { getAccountFromRequest, getBearerToken } = require("../server/auth-utils");
const { setCors } = require("../server/cors-utils");
const { getGoogleServiceAccount } = require("../server/google-service-account");

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const CORS_OPTIONS = {
  methods: ["POST", "OPTIONS"],
};
const DEFAULT_RATE_LIMIT_MAX = 12;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const uploadRateBuckets = globalThis.__randomChoiceUploadRateBuckets || new Map();

globalThis.__randomChoiceUploadRateBuckets = uploadRateBuckets;

function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  return request.body || {};
}

function sanitizeFileName(fileName) {
  return String(fileName || "upload")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function createHttpError(statusCode, error, detail = error) {
  const httpError = new Error(detail);
  httpError.statusCode = statusCode;
  httpError.publicError = error;
  return httpError;
}

function isPublicUploadAllowed() {
  return String(process.env.ALLOW_PUBLIC_UPLOAD || "").toLowerCase() === "true";
}

function getPositiveIntegerEnv(name, fallback) {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getClientIp(request) {
  const forwardedFor = request.headers?.["x-forwarded-for"] || request.headers?.["X-Forwarded-For"] || "";
  const firstForwardedIp = String(forwardedFor).split(",")[0].trim();
  return firstForwardedIp || request.headers?.["x-real-ip"] || request.socket?.remoteAddress || "unknown";
}

async function authorizeUploadRequest(request) {
  if (!getBearerToken(request)) {
    if (isPublicUploadAllowed()) {
      return {
        publicUpload: true,
        rateLimitKey: `public:${getClientIp(request)}`,
      };
    }

    throw createHttpError(401, "Authentication required");
  }

  try {
    const account = await getAccountFromRequest(request);
    return {
      accountId: account.id,
      publicUpload: false,
      rateLimitKey: `account:${account.id}`,
    };
  } catch {
    throw createHttpError(401, "Invalid or expired token");
  }
}

function checkUploadRateLimit(response, rateLimitKey) {
  const now = Date.now();
  const windowMs = getPositiveIntegerEnv("UPLOAD_RATE_LIMIT_WINDOW_MS", DEFAULT_RATE_LIMIT_WINDOW_MS);
  const maxRequests = getPositiveIntegerEnv("UPLOAD_RATE_LIMIT_MAX", DEFAULT_RATE_LIMIT_MAX);
  const bucket = (uploadRateBuckets.get(rateLimitKey) || []).filter((timestamp) => now - timestamp < windowMs);

  if (bucket.length >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - bucket[0])) / 1000));
    response.setHeader("Retry-After", String(retryAfterSeconds));
    response.setHeader("X-RateLimit-Limit", String(maxRequests));
    response.setHeader("X-RateLimit-Remaining", "0");
    throw createHttpError(429, "Upload rate limit exceeded");
  }

  bucket.push(now);
  uploadRateBuckets.set(rateLimitKey, bucket);
  response.setHeader("X-RateLimit-Limit", String(maxRequests));
  response.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - bucket.length)));
}

module.exports = async function handler(request, response) {
  setCors(request, response, CORS_OPTIONS);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const uploadAuth = await authorizeUploadRequest(request);
    checkUploadRateLimit(response, uploadAuth.rateLimitKey);

    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!bucketName) {
      response.status(500).json({ ok: false, error: "Upload temporarily unavailable" });
      return;
    }

    const requestBody = parseBody(request);
    const contentType = String(requestBody.contentType || "");
    const fileSize = Number(requestBody.fileSize || 0);

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      response.status(400).json({ error: "Unsupported file type" });
      return;
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      response.status(400).json({ error: "File size must be between 1 byte and 8 MB" });
      return;
    }

    const { projectId, credentials } = getGoogleServiceAccount();
    const storage = new Storage({ projectId, credentials });
    const safeName = sanitizeFileName(requestBody.fileName);
    const objectName = `world/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const file = storage.bucket(bucketName).file(objectName);
    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });
    const [viewUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    response.status(200).json({
      uploadUrl,
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      bucket: bucketName,
      objectName,
      filePath: objectName,
      publicUrl: `https://storage.googleapis.com/${bucketName}/${objectName}`,
      viewUrl,
      expiresInSeconds: 900,
      viewExpiresInSeconds: 604800,
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
      error: "Could not create upload URL",
    });
  }
};
