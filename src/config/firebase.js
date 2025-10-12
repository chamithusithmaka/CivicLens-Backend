const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Fix the private key if needed (environment variables may escape newlines)
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Initialize the Firebase admin SDK
const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey
  })
});

module.exports = app;