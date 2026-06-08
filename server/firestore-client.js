const { Firestore } = require("@google-cloud/firestore");
const { getGoogleServiceAccount } = require("./google-service-account");

let firestoreInstance;

function getFirestore() {
  if (!firestoreInstance) {
    const { projectId, credentials } = getGoogleServiceAccount();
    firestoreInstance = new Firestore({ projectId, credentials });
  }

  return firestoreInstance;
}

module.exports = {
  getFirestore,
};
