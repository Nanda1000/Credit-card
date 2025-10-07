import express from "express";
import { createPayment, getPayment, handleWebhook } from "../controllers/payment.controller";

const paymentRouter = express.Router();

paymentRouter.post("/payments/:userid", createPayment);
paymentRouter.get("/payments/:id", getPayment);
paymentRouter.post("/payments/:id/webhook", handleWebhook);

export default paymentRouter;