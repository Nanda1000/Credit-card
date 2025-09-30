import {prisma} from "../database/prisma.js";
import { pispService } from "./pisp.service.js";

export const paymentService = {async createPaymentRecord({ userId, cardId, amount, currency, method, idempotencyKey}){
    return prisma.payment.create({data:{userId, cardId, amount, currency, method, idempotencyKey}})
},

async initiatedRedirectPayment(paymentId) {
    const redirectUrl = `https://api.truelayer-sandbox.com/v3/single-immediate-payments/${paymentId}`;
    await prisma.payment.update({where:{id: paymentId}, data:{redirectUrl}});
    return redirectUrl;
},

async initiatePISP(paymentId) {
    // call provider API
    const providerResp = await pispService.createPayment({ paymentId });
    await prisma.payment.update({
      where: { id: paymentId },
      data: { providerPaymentId: providerResp.id },
    });
    return providerResp;
  },

async getPaymentStatus(paymentId) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error("Payment not found");
    return payment;
  },

async handleProviderWebhook(payload) {
    // verify signature with provider if possible
    const { providerPaymentId, status } = payload;

    const payment = await prisma.payment.findFirst({ where: { providerPaymentId } });
    if (!payment) throw new Error("Payment not found");

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status },
    });

    return { ok: true };
  },
};


