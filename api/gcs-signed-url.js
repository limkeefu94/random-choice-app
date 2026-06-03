const { Storage } = require("@google-cloud/storage");
const crypto = require("node:crypto");
const { getGoogleServiceAccount } = require("./google-service-account");

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

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

function setCors(response) {
  const allowedOrigin = process.env.GCS_ALLOWED_ORIGIN || "*";
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(request, response) {
  setCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!bucketName) {
      response.status(500).json({ error: "Missing GCS_BUCKET_NAME" });
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
    response.status(500).json({
      error: "Could not create upload URL",
      detail: error.message,
    });
  }
};
