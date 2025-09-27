import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.middleware.js";


const prisma = new PrismaClient();
const router = express.Router()

router.get("/me", verifyToken, async(req, res)=>{
    let user = await prisma.user.findUnique({where: {email: req.user.email}});
    if(!user) {
        user = await prisma.user.create({data: {email: req.user.email}});
    }
    res.json(user);
});

export default router;