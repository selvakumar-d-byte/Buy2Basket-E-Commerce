const { initializeApp, cert, getApps } = require("firebase-admin/app");

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountBase64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
}

const serviceAccountJson = Buffer
    .from(serviceAccountBase64, "base64")
    .toString("utf8");

const serviceAccount = JSON.parse(serviceAccountJson);

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount)
    });

module.exports = firebaseApp;