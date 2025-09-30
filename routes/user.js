import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.middleware.js";
import { deleteUser, getUserDetails, login, signup, updateUserDetails } from "../controllers/user.controller.js";

const router = express.Router()

router.post("/signup",verifyToken, signup);
router.get("/login",verifyToken, login);
router.get("/login/userdetails",verifyToken, getUserDetails);
router.put("/login/userdetails/update", verifyToken, updateUserDetails);
router.delete("/login/delete",verifyToken, deleteUser)

export default router;