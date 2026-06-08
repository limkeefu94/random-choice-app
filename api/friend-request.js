const { getFirestore } = require("./firestore-client");
const { cleanText, getAccountById, getAccountFromRequest, normalizeAvatar } = require("./auth-utils");
const { setCors } = require("./cors-utils");

const REQUEST_COLLECTION = "randomChoiceFriendRequests";
const FRIENDSHIP_COLLECTION = "randomChoiceFriendships";
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

function getPairId(firstAccountId, secondAccountId) {
  return [firstAccountId, secondAccountId]
    .sort()
    .join("_")
    .replace(/[^\w-]/g, "_")
    .slice(0, 260);
}

function publicFriendAccount(account) {
  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName || account.username,
    avatar: normalizeAvatar(account.avatar, account.displayName || account.username),
    avatarUrl: cleanText(account.avatarUrl, 1200),
    userId: account.userId,
  };
}

function getTargetAccountId(body) {
  return cleanText(body.targetAccountId || body.toAccountId || body.accountId, 120);
}

async function getDocument(collection, id) {
  const snapshot = await getFirestore().collection(collection).doc(id).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}

async function isBlockedBetween(firstAccountId, secondAccountId) {
  const firstBlocksSecond = await getDocument(BLOCK_COLLECTION, `${firstAccountId}_${secondAccountId}`);
  const secondBlocksFirst = await getDocument(BLOCK_COLLECTION, `${secondAccountId}_${firstAccountId}`);

  return [firstBlocksSecond, secondBlocksFirst].some((block) => block && block.status !== "inactive");
}

async function assertTargetAccount(currentAccount, targetAccountId) {
  if (!targetAccountId) {
    const error = new Error("targetAccountId is required");
    error.statusCode = 400;
    throw error;
  }

  if (targetAccountId === currentAccount.id) {
    const error = new Error("不能加自己为好友");
    error.statusCode = 400;
    throw error;
  }

  const targetAccount = await getAccountById(targetAccountId);

  if (!targetAccount) {
    const error = new Error("Target account not found");
    error.statusCode = 404;
    throw error;
  }

  if (await isBlockedBetween(currentAccount.id, targetAccount.id)) {
    const error = new Error("Blocked accounts cannot send friend requests");
    error.statusCode = 403;
    throw error;
  }

  return targetAccount;
}

async function sendRequest(account, body) {
  const targetAccount = await assertTargetAccount(account, getTargetAccountId(body));
  const requestId = getPairId(account.id, targetAccount.id);
  const friendship = await getDocument(FRIENDSHIP_COLLECTION, requestId);

  if (friendship?.status === "active") {
    const error = new Error("Already friends");
    error.statusCode = 409;
    throw error;
  }

  const existingRequest = await getDocument(REQUEST_COLLECTION, requestId);

  if (existingRequest?.status === "pending") {
    const error = new Error("Friend request already pending");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const friendRequest = {
    id: requestId,
    requesterAccountId: account.id,
    requesterUsername: account.username || "",
    receiverAccountId: targetAccount.id,
    receiverUsername: targetAccount.username || "",
    status: "pending",
    createdAt: existingRequest?.createdAt || now,
    updatedAt: now,
  };

  await getFirestore().collection(REQUEST_COLLECTION).doc(requestId).set(friendRequest);

  return {
    request: friendRequest,
    target: publicFriendAccount(targetAccount),
  };
}

async function getPendingRequestForAction(account, body) {
  const requestId = cleanText(body.requestId, 260) || getPairId(account.id, getTargetAccountId(body));
  const friendRequest = await getDocument(REQUEST_COLLECTION, requestId);

  if (!friendRequest) {
    const error = new Error("Friend request not found");
    error.statusCode = 404;
    throw error;
  }

  if (friendRequest.status !== "pending") {
    const error = new Error("Friend request is not pending");
    error.statusCode = 409;
    throw error;
  }

  return friendRequest;
}

async function acceptRequest(account, body) {
  const friendRequest = await getPendingRequestForAction(account, body);

  if (friendRequest.receiverAccountId !== account.id) {
    const error = new Error("Only the receiver can accept this request");
    error.statusCode = 403;
    throw error;
  }

  if (await isBlockedBetween(friendRequest.requesterAccountId, friendRequest.receiverAccountId)) {
    const error = new Error("Blocked accounts cannot become friends");
    error.statusCode = 403;
    throw error;
  }

  const now = new Date().toISOString();
  const friendshipId = getPairId(friendRequest.requesterAccountId, friendRequest.receiverAccountId);
  const friendship = {
    id: friendshipId,
    accountIds: [friendRequest.requesterAccountId, friendRequest.receiverAccountId].sort(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  await getFirestore().collection(FRIENDSHIP_COLLECTION).doc(friendshipId).set(friendship, { merge: true });
  await getFirestore().collection(REQUEST_COLLECTION).doc(friendRequest.id).set({
    ...friendRequest,
    status: "accepted",
    updatedAt: now,
  });

  return {
    requestId: friendRequest.id,
    friendship,
  };
}

async function declineRequest(account, body) {
  const friendRequest = await getPendingRequestForAction(account, body);

  if (friendRequest.receiverAccountId !== account.id) {
    const error = new Error("Only the receiver can decline this request");
    error.statusCode = 403;
    throw error;
  }

  const now = new Date().toISOString();
  await getFirestore().collection(REQUEST_COLLECTION).doc(friendRequest.id).set({
    ...friendRequest,
    status: "declined",
    updatedAt: now,
  });

  return { requestId: friendRequest.id };
}

async function cancelRequest(account, body) {
  const friendRequest = await getPendingRequestForAction(account, body);

  if (friendRequest.requesterAccountId !== account.id) {
    const error = new Error("Only the requester can cancel this request");
    error.statusCode = 403;
    throw error;
  }

  const now = new Date().toISOString();
  await getFirestore().collection(REQUEST_COLLECTION).doc(friendRequest.id).set({
    ...friendRequest,
    status: "cancelled",
    updatedAt: now,
  });

  return { requestId: friendRequest.id };
}

function sendError(response, error) {
  const needsLogin = error.message === "Invalid token" || error.message === "Expired token" || error.message === "Account not found";
  const statusCode = needsLogin ? 401 : error.statusCode || 500;

  response.status(statusCode).json({
    ok: false,
    error: needsLogin ? "请重新登入" : error.message || "好友申请暂时处理不了",
  });
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
    const action = cleanText(body.action, 20);
    const actionHandlers = {
      send: sendRequest,
      accept: acceptRequest,
      decline: declineRequest,
      cancel: cancelRequest,
    };
    const actionHandler = actionHandlers[action];

    if (!actionHandler) {
      response.status(400).json({ ok: false, error: "Unsupported friend request action" });
      return;
    }

    const result = await actionHandler(account, body);

    response.status(200).json({
      ok: true,
      action,
      ...result,
    });
  } catch (error) {
    sendError(response, error);
  }
};
