// routes/user.routes.js
import express from "express";
import { getMyDetails, updateMyDetails } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// protect routes with verifyToken
router.get("/me", verifyToken, getMyDetails);
router.put("/me", verifyToken, updateMyDetails);

export default router;
