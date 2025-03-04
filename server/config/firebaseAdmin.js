const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

let serviceAccount;

if (process.env.SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
} else {
  // Optional: Load from a local file for development
  serviceAccount = require("./path/to/serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
