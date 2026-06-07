const crypto = require("node:crypto");
const { getFirestore } = require("./firestore-client");
const { getAccountFromRequest, getBearerToken } = require("./auth-utils");
const { setCors } = require("./cors-utils");

const ALLOWED_COLLECTIONS = new Set(["history", "favorites", "uploads"]);
const MAX_ITEMS = 30;
const CORS_OPTIONS = {
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
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

function createHttpError(statusCode, error, detail = error) {
  const httpError = new Error(detail);
  httpError.statusCode = statusCode;
  httpError.publicError = error;
  return httpError;
}

function isAnonSyncAllowed() {
  return String(process.env.ALLOW_ANON_SYNC || "").toLowerCase() === "true";
}

function normalizeUserId(userId) {
  const normalized = String(userId || "").trim();

  if (!/^anon_[a-zA-Z0-9_-]{12,80}$/.test(normalized)) {
    throw createHttpError(400, "Invalid userId");
  }

  return normalized;
}

function normalizeCollection(collection) {
  const normalized = String(collection || "").trim();

  if (!ALLOWED_COLLECTIONS.has(normalized)) {
    throw createHttpError(400, "Invalid collection");
  }

  return normalized;
}

async function authorizeUserDataAccess(request, requestedUserId) {
  if (!getBearerToken(request)) {
    if (isAnonSyncAllowed()) {
      return {
        anonymous: true,
        userId: requestedUserId,
      };
    }

    throw createHttpError(401, "Authentication required");
  }

  let account;

  try {
    account = await getAccountFromRequest(request);
  } catch {
    throw createHttpError(401, "Invalid or expired token");
  }

  const accountUserId = normalizeUserId(account.userId);

  if (accountUserId !== requestedUserId) {
    throw createHttpError(403, "Forbidden");
  }

  return {
    accountId: account.id,
    anonymous: false,
    userId: accountUserId,
  };
}

function collectionRef(userId, collection) {
  return getFirestore()
    .collection("randomChoiceUsers")
    .doc(userId)
    .collection(collection);
}

function toSerializableItem(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    ...data,
    id: data.id || documentSnapshot.id,
  };
}

function cleanText(value, maxLength = 400) {
  return String(value || "").slice(0, maxLength);
}

function cleanItem(collection, item) {
  const now = new Date().toISOString();
  const id = cleanText(item.id, 120) || `${Date.now()}-${crypto.randomUUID()}`;
  const createdAt = cleanText(item.createdAt, 40) || now;

  if (collection === "uploads") {
    return {
      id,
      imageUrl: cleanText(item.imageUrl || item.url || item.publicUrl, 1200),
      publicUrl: cleanText(item.publicUrl, 1200),
      filePath: cleanText(item.filePath || item.objectName, 500),
      fileName: cleanText(item.fileName || item.name, 160),
      contentType: cleanText(item.contentType, 80),
      createdAt,
    };
  }

  const cleanedItem = {
    id,
    mode: cleanText(item.mode, 40),
    title: cleanText(item.title, 220),
    meta: cleanText(item.meta, 1200),
    label: cleanText(item.label, 120),
    time: cleanText(item.time, 40),
    createdAt,
  };

  if (Array.isArray(item.digits)) {
    cleanedItem.digits = item.digits.slice(0, 8).map((digit) => cleanText(digit, 8));
  }

  return cleanedItem;
}

async function readUserData(userId) {
  const result = {};

  await Promise.all([...ALLOWED_COLLECTIONS].map(async (collection) => {
    const snapshot = await collectionRef(userId, collection)
      .orderBy("createdAt", "desc")
      .limit(MAX_ITEMS)
      .get();

    result[collection] = snapshot.docs.map(toSerializableItem);
  }));

  return result;
}

async function writeUserItem(userId, collection, item) {
  const cleanedItem = cleanItem(collection, item || {});
  await collectionRef(userId, collection).doc(cleanedItem.id).set(cleanedItem, { merge: true });
  return cleanedItem;
}

async function clearCollections(userId, collections) {
  const safeCollections = collections.map(normalizeCollection);

  await Promise.all(safeCollections.map(async (collection) => {
    const snapshot = await collectionRef(userId, collection).limit(100).get();
    const batch = getFirestore().batch();

    snapshot.docs.forEach((documentSnapshot) => {
      batch.delete(documentSnapshot.ref);
    });

    if (!snapshot.empty) {
      await batch.commit();
    }
  }));
}

module.exports = async function handler(request, response) {
  setCors(request, response, CORS_OPTIONS);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  try {
    if (request.method === "GET") {
      const userId = normalizeUserId(getQueryParam(request, "userId"));
      await authorizeUserDataAccess(request, userId);
      response.status(200).json({
        ok: true,
        userId,
        data: await readUserData(userId),
      });
      return;
    }

    if (request.method === "POST") {
      const requestBody = parseBody(request);
      const userId = normalizeUserId(requestBody.userId);
      await authorizeUserDataAccess(request, userId);
      const collection = normalizeCollection(requestBody.collection);
      const item = await writeUserItem(userId, collection, requestBody.item);

      response.status(200).json({
        ok: true,
        userId,
        collection,
        item,
      });
      return;
    }

    if (request.method === "DELETE") {
      const requestBody = parseBody(request);
      const userId = normalizeUserId(requestBody.userId);
      await authorizeUserDataAccess(request, userId);
      const collections = Array.isArray(requestBody.collections) ? requestBody.collections : [];
      await clearCollections(userId, collections);

      response.status(200).json({
        ok: true,
        userId,
        collections,
      });
      return;
    }

    response.status(405).json({ error: "Method not allowed" });
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
      error: "Firestore sync failed",
      detail: error.message,
    });
  }
};
