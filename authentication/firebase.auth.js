// firebase.auth.js
import admin from "firebase-admin";
import serviceAccount from "../firebase-key.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
