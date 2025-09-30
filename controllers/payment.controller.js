// controllers/payment.controller.js
import { paymentService } from "../services/payment.service.js";

export const createPayment = async (req, res) => {
  try {
    const { cardId, amount, currency = "GBP", method, idempotencyKey } = req.body;

    if (!["redirect", "pisp", "manual"].includes(method)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const payment = await paymentService.createPaymentRecord({
      userId: req.user.id,
      cardId,
      amount,
      currency,
      method,
      idempotencyKey,
    });

    if (method === "redirect") {
      const url = await paymentService.initiateRedirectPayment(payment.id);
      return res.status(201).json({ redirectUrl: url });
    }

    if (method === "pisp") {
      const resp = await paymentService.initiatePISP(payment.id);
      return res.status(201).json({ status: "pending", provider: resp });
    }

    return res.status(201).json({ payment });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPayment = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentStatus(req.params.id);
    res.status(200).json(payment);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    await paymentService.handleProviderWebhook(req.body);
    res.status(200).send("ok");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
