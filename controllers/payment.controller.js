// controllers/payment.controller.js
import { paymentService } from "../services/payment.service.js";

export const createPayment = async (req, res) => {
  try {
    const { cardId, amount, currency = "GBP", idempotencyKey } = req.body;

    // Create a local payment record
    const payment = await paymentService.createPaymentRecord({
      userId: req.user.id,
      cardId,
      amount,
      currency,
      method: "pisp", // always pisp for API-based flow
      idempotencyKey,
    });

    // Initiate payment through TrueLayer
    const { redirectUrl, providerPaymentId } = await paymentService.initiatePISP(payment.id);

    return res.status(201).json({
      status: "authorization_required",
      redirectUrl,           // frontend should redirect user here
      providerPaymentId,     // store if needed for webhooks later
    });

  } catch (err) {
    console.error(err);
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
