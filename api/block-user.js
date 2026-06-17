const { getFirestore } = require("../server/firestore-client");
const { cleanText, getAccountFromRequest } = require("../server/auth-utils");
const { setCors } = require("../server/cors-utils");

const BLOCK_COLLECTION = "randomChoiceBlocks";
const CORS_OPTIONS = {
  methods: ["POST", "OPTIONS"],
};

function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  return request.body || {};
}

function getBlockId(blockerAccountId, blockedAccountId) {
  return `${blockerAccountId}_${blockedAccountId}`.replace(/[^\w-]/g, "_").slice(0, 260);
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
    const account = await getAccountFromRequest(request);
    const body = parseBody(request);
    const blockedAccountId = cleanText(body.blockedAccountId || body.accountId, 120);

    if (!blockedAccountId) {
      response.status(400).json({ ok: false, error: "blockedAccountId is required" });
      return;
    }

    if (blockedAccountId === account.id) {
      response.status(400).json({ ok: false, error: "不能封锁自己" });
      return;
    }

    const now = new Date().toISOString();
    const blockId = getBlockId(account.id, blockedAccountId);
    const block = {
      id: blockId,
      blockerAccountId: account.id,
      blockedAccountId,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    await getFirestore().collection(BLOCK_COLLECTION).doc(blockId).set(block, { merge: true });

    response.status(201).json({
      ok: true,
      id: blockId,
    });
  } catch (error) {
    const needsLogin = error.message === "Invalid token" || error.message === "Expired token" || error.message === "Account not found";

    response.status(needsLogin ? 401 : 500).json({
      ok: false,
      error: needsLogin ? "请重新登入" : "封锁暂时处理不了",
    });
  }
};
