function getGoogleServiceAccount() {
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

module.exports = {
  getGoogleServiceAccount,
};
