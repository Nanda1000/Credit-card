// routes/user.routes.js
import express from "express";
import { getMyDetails, updateMyDetails, deleteMyAccount } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// protect routes with verifyToken
router.get("/users/me", verifyToken, getMyDetails);
router.put("/users/me", verifyToken, updateMyDetails);
router.delete("/users/me", verifyToken, deleteMyAccount);

export default router;
