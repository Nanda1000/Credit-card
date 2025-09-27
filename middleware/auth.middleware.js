import admin from "../authentication/firebase.auth.js";

export async function verifyToken(req, res, next) {
    try{
        const token = req.headers.authorization?.split(" ")[1];
        if(!token) return res.status(401).send("No token");

        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        next();
    } catch(err) {
        res.status(401).send("Invalid token");
    }

}