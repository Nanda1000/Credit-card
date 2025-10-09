import {prisma} from "../database/prisma.js";
import { pispService } from "./pisp.service.js";

export const paymentService = {async createPaymentRecord({ userId, cardId, amount, currency, method, idempotencyKey}){
    return prisma.payment.create({data:{userId, cardId, amount, currency, method, idempotencyKey}})
},

async initiatePISP(paymentId) {
  if (!paymentId) throw new Error("Payment ID is required");

  const providerResp = await pispService.createPayment({ paymentId });
  if (!providerResp || !providerResp.authorization_flow)
    throw new Error("Invalid provider response");

  const redirectUrl = providerResp.authorization_flow.actions?.next?.uri;

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      providerPaymentId: providerResp.id,
      redirectUrl,
    },
  });

  return { providerPaymentId: providerResp.id, redirectUrl };
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


