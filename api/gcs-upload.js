const { Storage } = require("@google-cloud/storage");
const crypto = require("node:crypto");

const MAX_FILE_SIZE = 2.5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function getServiceAccount() {
  if (process.env.GCS_SERVICE_ACCOUNT_JSON_BASE64) {
    const jsonText = Buffer.from(process.env.GCS_SERVICE_ACCOUNT_JSON_BASE64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(jsonText);

    return {
      projectId: serviceAccount.project_id || process.env.GCP_PROJECT_ID,
      credentials: serviceAccount,
    };
  }

  const clientEmail = process.env.GCS_CLIENT_EMAIL || process.env.GCP_CLIENT_EMAIL;
  const privateKey = process.env.GCS_PRIVATE_KEY || process.env.GCP_PRIVATE_KEY;

  if (!process.env.GCP_PROJECT_ID || !clientEmail || !privateKey) {
    throw new Error("Missing Google Cloud environment variables");
  }

  return {
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    },
  };
}

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
      response.status(400).json({ error: "Unsupported image type" });
      return;
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      response.status(400).json({ error: "Image size must be between 1 byte and 2.5 MB" });
      return;
    }

    const buffer = Buffer.from(String(requestBody.data || ""), "base64");

    if (!buffer.length || buffer.length > MAX_FILE_SIZE) {
      response.status(400).json({ error: "Invalid image payload" });
      return;
    }

    const { projectId, credentials } = getServiceAccount();
    const storage = new Storage({ projectId, credentials });
    const safeName = sanitizeFileName(requestBody.fileName);
    const objectName = `world/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const file = storage.bucket(bucketName).file(objectName);

    await file.save(buffer, {
      resumable: false,
      contentType,
      metadata: {
        contentType,
      },
    });

    const [viewUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    response.status(200).json({
      url: viewUrl,
      viewUrl,
      publicUrl: `https://storage.googleapis.com/${bucketName}/${objectName}`,
      bucket: bucketName,
      objectName,
      filePath: objectName,
      viewExpiresInSeconds: 604800,
    });
  } catch (error) {
    response.status(500).json({
      error: "Could not upload image",
      detail: error.message,
    });
  }
};
