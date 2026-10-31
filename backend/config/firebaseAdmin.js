const { initializeApp, cert, getApps } = require("firebase-admin/app");

const encodedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!encodedServiceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
}

const serviceAccount = JSON.parse(encodedServiceAccount);

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount)
    });

module.exports = firebaseApp;