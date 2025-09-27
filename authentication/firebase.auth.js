import admin from "firebase-admin";
import serviceAccount from "../firebase-key.json";

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
})

export default admin;