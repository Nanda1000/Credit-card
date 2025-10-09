import { pispService } from "../services/pisp.service.js";
import { prisma } from "../database/prisma.js";
import { paymentService } from "../services/payment.service.js";

// ✅ Mock the Prisma client
jest.mock("../database/prisma.js", () => ({
  prisma: {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// ✅ Mock the PISP service
jest.mock("../services/pisp.service.js", () => ({
  pispService: {
    createPayment: jest.fn(),
  },
}));

describe("Payment service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // 🔹 initiatePISP
  // -----------------------------
  describe("initiatePISP", () => {
    it("should throw error if paymentId is missing", async () => {
      await expect(paymentService.initiatePISP(null))
        .rejects.toThrow("Payment ID is required");
    });

    it("should throw error if provider response is invalid", async () => {
      pispService.createPayment.mockResolvedValue(undefined);

      await expect(paymentService.initiatePISP("456"))
        .rejects.toThrow("Invalid provider response");
    });

    it("should update payment and return redirect URL if successful", async () => {
      const mockProviderResp = {
        id: "567",
        authorization_flow: {
          actions: { next: { uri: "https://time.com" } },
        },
      };

      pispService.createPayment.mockResolvedValue(mockProviderResp);

      prisma.payment.update.mockResolvedValue({
        id: "1",
        providerPaymentId: "567",
        redirectUrl: "https://time.com",
      });

      const result = await paymentService.initiatePISP("456");

      expect(pispService.createPayment).toHaveBeenCalledWith({ paymentId: "456" });
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: "456" },
        data: {
          providerPaymentId: "567",
          redirectUrl: "https://time.com",
        },
      });
      expect(result).toEqual({
        providerPaymentId: "567",
        redirectUrl: "https://time.com",
      });
    });
  });

  // -----------------------------
  // 🔹 getPaymentStatus
  // -----------------------------
  describe("getPaymentStatus", () => {
    it("should throw error if paymentId is missing", async () => {
      await expect(paymentService.getPaymentStatus(null))
        .rejects.toThrow("Payment not found");
    });

    it("should throw error if payment not found", async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(paymentService.getPaymentStatus("456"))
        .rejects.toThrow("Payment not found");
    });

    it("should return payment if found", async () => {
      const mockPayment = { id: "1", userId: "123", status: "Pending" };
      prisma.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await paymentService.getPaymentStatus("456");

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { id: "456" },
      });
      expect(result).toEqual(mockPayment);
    });
  });

  // -----------------------------
  // 🔹 handleProviderWebhook
  // -----------------------------
  describe("handleProviderWebhook", () => {
    

    it("should throw error if payment not found", async () => {
      prisma.payment.findFirst.mockResolvedValue(null);

      const payload = { providerPaymentId: "567", status: "Completed" };

      await expect(paymentService.handleProviderWebhook(payload))
        .rejects.toThrow("Payment not found");
    });

    it("should update payment if found", async () => {
      const payload = { providerPaymentId: "567", status: "Completed" };
      const mockPayment = { id: "1", providerPaymentId: "567" };

      prisma.payment.findFirst.mockResolvedValue(mockPayment);
      prisma.payment.update.mockResolvedValue({
        ...mockPayment,
        status: "Completed",
      });

      const result = await paymentService.handleProviderWebhook(payload);

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { status: "Completed" },
      });
      expect(result).toEqual({ ok: true });
    });
  });
});
