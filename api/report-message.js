const { getFirestore } = require("../server/firestore-client");
const { cleanText, getAccountFromRequest } = require("../server/auth-utils");
const { setCors } = require("../server/cors-utils");

const REPORT_COLLECTION = "randomChoiceReports";
const WORLD_COLLECTION = "randomChoiceWorldMessages";
const CORS_OPTIONS = {
  methods: ["POST", "OPTIONS"],
};

function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  return request.body || {};
}

function getReportId(reporterAccountId, messageId) {
  return `${reporterAccountId}_${messageId}`.replace(/[^\w-]/g, "_").slice(0, 260);
}

async function getWorldMessage(messageId) {
  const snapshot = await getFirestore().collection(WORLD_COLLECTION).doc(messageId).get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
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
    const account = await getAccountFromRequest(request);
    const body = parseBody(request);
    const messageId = cleanText(body.messageId, 180);
    const reason = cleanText(body.reason, 500);

    if (!messageId) {
      response.status(400).json({ ok: false, error: "messageId is required" });
      return;
    }

    const message = await getWorldMessage(messageId);

    if (!message) {
      response.status(404).json({ ok: false, error: "Message not found" });
      return;
    }

    const reportId = getReportId(account.id, messageId);
    const reportRef = getFirestore().collection(REPORT_COLLECTION).doc(reportId);
    const existingReport = await reportRef.get();

    if (existingReport.exists) {
      response.status(200).json({
        ok: true,
        id: reportId,
        duplicate: true,
      });
      return;
    }

    const now = new Date().toISOString();
    const report = {
      id: reportId,
      messageId,
      reporterAccountId: account.id,
      reporterUsername: account.username || "",
      reportedAccountId: message.accountId || "",
      reason,
      status: "new",
      createdAt: now,
      updatedAt: now,
    };

    await reportRef.set(report);

    response.status(201).json({
      ok: true,
      id: report.id,
    });
  } catch (error) {
    const needsLogin = error.message === "Invalid token" || error.message === "Expired token" || error.message === "Account not found";

    response.status(needsLogin ? 401 : 500).json({
      ok: false,
      error: needsLogin ? "请重新登入" : "举报暂时提交不了",
      detail: error.message,
    });
  }
};
