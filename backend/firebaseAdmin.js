const fs = require("fs");
const path = require("path");

const admin = require("firebase-admin");

let initialized = false;

/** Trim quotes / trailing commas often pasted from JSON or Render UI */
const cleanSimple = (v) => {
  if (v == null || typeof v !== "string") return "";
  let s = v.trim();
  if (s.endsWith(",")) s = s.slice(0, -1).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  if (s.endsWith(",")) s = s.slice(0, -1).trim();
  return s;
};

const cleanPrivateKey = (v) => {
  const s = cleanSimple(v);
  return s.replace(/\\n/g, "\n");
};

const initFirebaseAdmin = () => {
  if (initialized) return admin;
  if (admin.apps?.length) {
    initialized = true;
    return admin;
  }

  const projectId = cleanSimple(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = cleanSimple(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey =
    privateKeyRaw != null && String(privateKeyRaw).trim() !== ""
      ? cleanPrivateKey(privateKeyRaw)
      : "";

  if (projectId && clientEmail && privateKey) {
    console.log("✅ Firebase Admin: using environment variables");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    initialized = true;
    return admin;
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.join(process.cwd(), serviceAccountPath);
    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = require(resolvedPath);
      console.log("✅ Firebase Admin: using service account file");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
      return admin;
    }
    console.warn(
      `Firebase Admin: FIREBASE_SERVICE_ACCOUNT_PATH is set (${serviceAccountPath}) but file was not found at ${resolvedPath}. Skipping file; set FIREBASE_* env vars for Render.`
    );
  }

  console.warn(
    "Firebase Admin not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (recommended for Render), or a valid FIREBASE_SERVICE_ACCOUNT_PATH."
  );
  return null;
};

const verifyIdToken = async (idToken) => {
  initFirebaseAdmin();
  if (!admin.apps?.length) {
    const err = new Error("Google sign-in is not configured on the server");
    err.statusCode = 503;
    throw err;
  }
  return admin.auth().verifyIdToken(idToken);
};

module.exports = { admin, initFirebaseAdmin, verifyIdToken };
