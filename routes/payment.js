import express from "express";
import { createPayment, getPayment, handleWebhook } from "../controllers/payment.controller";

const paymentRouter = express.Router();

paymentRouter.post("/create", createPayment);
paymentRouter.get("/:id", getPayment);
paymentRouter.post("/webhook", handleWebhook);

export { paymentRouter };