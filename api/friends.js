const { getFirestore } = require("../server/firestore-client");
const { cleanText, getAccountById, getAccountFromRequest, normalizeAvatar } = require("../server/auth-utils");
const { setCors } = require("../server/cors-utils");

const FRIENDSHIP_COLLECTION = "randomChoiceFriendships";
const CORS_OPTIONS = {
  methods: ["GET", "OPTIONS"],
};

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

async function readFriendships(accountId) {
  const snapshot = await getFirestore()
    .collection(FRIENDSHIP_COLLECTION)
    .where("accountIds", "array-contains", accountId)
    .limit(500)
    .get();

  return snapshot.docs
    .map((documentSnapshot) => ({ id: documentSnapshot.id, ...documentSnapshot.data() }))
    .filter((friendship) => friendship.status === "active");
}

async function readFriends(accountId) {
  const friendships = await readFriendships(accountId);
  const friendIds = [...new Set(friendships
    .flatMap((friendship) => friendship.accountIds || [])
    .filter((friendId) => friendId && friendId !== accountId))];
  const friends = await Promise.all(friendIds.map(getAccountById));

  return friends
    .filter(Boolean)
    .map(publicFriendAccount);
}

module.exports = async function handler(request, response) {
  setCors(request, response, CORS_OPTIONS);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const account = await getAccountFromRequest(request);
    const friends = await readFriends(account.id);

    response.status(200).json({
      ok: true,
      friends,
    });
  } catch (error) {
    const needsLogin = error.message === "Invalid token" || error.message === "Expired token" || error.message === "Account not found";

    response.status(needsLogin ? 401 : 500).json({
      ok: false,
      error: needsLogin ? "请重新登入" : "好友列表暂时读取不了",
      detail: error.message,
    });
  }
};
