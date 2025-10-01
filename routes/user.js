import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.middleware.js";
import { deleteUser, getUserDetails, login, signup, updateUserDetails } from "../controllers/user.controller.js";

const router = express.Router()

router.post("/users/me",verifyToken, signup);
router.get("/users/me",verifyToken, login);
router.get("/users/me/details",verifyToken, getUserDetails);
router.put("/users/me/details/update", verifyToken, updateUserDetails);
router.delete("/users/me/delete",verifyToken, deleteUser)

export default router;