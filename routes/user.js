// routes/user.routes.js
import express from "express";
import { getMyDetails, updateMyDetails, deleteMyAccount } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// protect routes with verifyToken
router.get("/users/:userId", verifyToken, getMyDetails);
router.patch("/users/:userId", verifyToken, updateMyDetails);
router.delete("/users/:userId", verifyToken, deleteMyAccount);

export default router;
