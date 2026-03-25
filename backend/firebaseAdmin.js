const admin = require("firebase-admin");

let initialized = false;

const initFirebaseAdmin = () => {
  if (initialized) return admin;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath) {
    // Service account JSON file path (server-side only).
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
    initialized = true;
    return admin;
  }

  console.warn(
    "Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
  );
  return null;
};

module.exports = { admin, initFirebaseAdmin };
