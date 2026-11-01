const { initializeApp, cert, getApps } = require("firebase-admin/app");

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
}

let serviceAccount;

try {
    serviceAccount = JSON.parse(serviceAccountJson);
} catch (error) {
    throw new Error("Invalid Firebase Service Account JSON format");
}

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
    });

module.exports = firebaseApp;