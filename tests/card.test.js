jest.mock("../database/prisma.js", () => ({
  prisma: {
    card: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("../services/carddata.service.js", () => ({
  cardData: {
    balanceCard: jest.fn(),
    singleCard: jest.fn(),
  },
}));

jest.mock("../services/utils/validation.js", () => ({
  validationUtils: {
    isValidCardNumber: jest.fn(),
    isValidDate: jest.fn(),
    isPositiveNumber: jest.fn(),
    maskCardNumber: jest.fn(),
  },
}));

import { cardService } from "../services/card.service.js";
import { prisma } from "../database/prisma.js";
import { cardData } from "../services/carddata.service.js";
import { validationUtils } from "../services/utils/validation.js";

describe("Card Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- getCardsByUser ----------------
  describe("getCardsByUser", () => {
    it("should throw error if no userId", async () => {
      await expect(cardService.getCardsByUser(null))
        .rejects.toThrow("User ID is required");
    });

    it("should return cards for a valid user", async () => {
      const mockCards = [{ id: "1", userId: "123", displayName: "Test" }];
      prisma.card.findMany.mockResolvedValue(mockCards);

      const result = await cardService.getCardsByUser("123");

      expect(prisma.card.findMany).toHaveBeenCalledWith({ where: { userId: "123" } });
      expect(result).toEqual(mockCards);
    });
  });

  // ---------------- getCardById ----------------
  describe("getCardById", () => {
    it("should throw error if no cardId or userId", async () => {
      await expect(cardService.getCardById(null, null))
        .rejects.toThrow("User ID and Card ID are required");
    });

    it("should throw error if card not found", async () => {
      prisma.card.findUnique.mockResolvedValue(null);
      await expect(cardService.getCardById("1", "123"))
        .rejects.toThrow("Card not found");
    });

    it("should throw error if unauthorized", async () => {
      prisma.card.findUnique.mockResolvedValue({ id: "1", userId: "456" });
      await expect(cardService.getCardById("1", "123"))
        .rejects.toThrow("Unauthorized");
    });

    it("should return card for valid user", async () => {
      const mockCard = { id: "1", userId: "123" };
      prisma.card.findUnique.mockResolvedValue(mockCard);
      const result = await cardService.getCardById("1", "123");
      expect(result).toEqual(mockCard);
    });
  });

  // ---------------- updateCard ----------------
  describe("updateCard", () => {
    it("should throw error if args missing", async () => {
      await expect(cardService.updateCard(null, null, null))
        .rejects.toThrow("User ID, Card ID and update data are required");
    });

    it("should update card for a valid user", async () => {
      const mockCard = { id: "c123", userId: "2", displayName: "Updated Card" };

      prisma.card.findUnique.mockResolvedValue({ id: "c123", userId: "2" });
      prisma.card.update.mockResolvedValue(mockCard);

      const result = await cardService.updateCard("c123", "2", { displayName: "Updated Card" });

      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: "c123" },
        data: { displayName: "Updated Card" },
      });
      expect(result).toEqual(mockCard);
    });
  });

  // ---------------- deleteCard ----------------
  describe("deleteCard", () => {
    it("should throw error if args missing", async () => {
      await expect(cardService.deleteCard(null, null))
        .rejects.toThrow("User ID and Card ID are required");
    });

    it("should delete card for a valid user", async () => {
      const mockCard = { id: "c123", userId: "2", displayName: "Delete Card" };
      prisma.card.findUnique.mockResolvedValue({ id: "c123", userId: "2" });
      prisma.card.delete.mockResolvedValue(mockCard);

      const result = await cardService.deleteCard("c123", "2");

      expect(prisma.card.delete).toHaveBeenCalledWith({
        where: { id: "c123" },
      });
      expect(result).toEqual(mockCard);
    });
  });

  // ---------------- createCard ----------------
  describe("createCard", () => {
    it("should throw error for invalid card number", async () => {
      validationUtils.isValidCardNumber.mockReturnValue(false);
      validationUtils.isValidDate.mockReturnValue(true);
      validationUtils.isPositiveNumber.mockReturnValue(true);

      await expect(
        cardService.createCard("u1", { cardNumber: "123", validTo: "12/30", accountId: 1 })
      ).rejects.toThrow("Invalid card number");
    });

    it("should throw error for invalid expiry date", async () => {
      validationUtils.isValidCardNumber.mockReturnValue(true);
      validationUtils.isValidDate.mockReturnValue(false);
      validationUtils.isPositiveNumber.mockReturnValue(true);

      await expect(
        cardService.createCard("u1", { cardNumber: "1234567812345678", validTo: "01/20", accountId: 1 })
      ).rejects.toThrow("Card expired or invalid date");
    });

    it("should create card for valid input", async () => {
      validationUtils.isValidCardNumber.mockReturnValue(true);
      validationUtils.isValidDate.mockReturnValue(true);
      validationUtils.isPositiveNumber.mockReturnValue(true);
      validationUtils.maskCardNumber.mockReturnValue("************5678");

      const cardInput = {
        bankName: "HSBC",
        cardType: "credit",
        cardNetwork: "VISA",
        accountId: 123,
        providerId: "prov123",
        cardNumber: "1234567812345678",
        displayName: "New Card",
        nameOnCard: "Kumar",
        validFrom: "01/25",
        validTo: "12/30",
      };

      prisma.card.create.mockResolvedValue({ id: "c123", userId: "u1", displayName: "New Card" });

      const result = await cardService.createCard("u1", cardInput);

      expect(validationUtils.isValidCardNumber).toHaveBeenCalledWith("1234567812345678");
      expect(validationUtils.isValidDate).toHaveBeenCalledWith("12/30");
      expect(prisma.card.create).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ id: "c123" }));
    });
  });

  // ---------------- getAllBalanceData ----------------
  describe("getAllBalanceData", () => {
    it("should return null if no balance data", async () => {
      cardData.balanceCard.mockResolvedValue({ results: [] });

      const result = await cardService.getAllBalanceData({ id: "c1", accountId: "acc123" });
      expect(result).toBeNull();
    });

    it("should return balance data for valid card", async () => {
      const mockCard = { id: "1", accountId: "acc123" };

      cardData.balanceCard.mockResolvedValue({
        results: [{
          available: 7500,
          currency: "GBP",
          credit_limit: 10000,
          last_statement_balance: 200,
          last_statement_date: "2025-09-01",
          payment_due: 500,
          payment_due_date: "2025-09-15",
        }],
      });

      prisma.card.update.mockResolvedValue({});

      const result = await cardService.getAllBalanceData(mockCard);

      expect(result).toEqual(expect.objectContaining({
        availableBalance: 7500,
        creditLimit: 10000,
        dueAmount: 500,
      }));
    });
  });

  // ---------------- calculateUtilization ----------------
  describe("calculateUtilization", () => {
    it("should return 0 if no balance data", async () => {
      jest.spyOn(cardService, "getAllBalanceData").mockResolvedValue(null);
      const result = await cardService.calculateUtilization("c123");
      expect(result).toBe(0);
    });

    it("should return 0 if creditLimit is missing", async () => {
      jest.spyOn(cardService, "getAllBalanceData").mockResolvedValue({
        availableBalance: 500,
        creditLimit: 0,
      });
      const result = await cardService.calculateUtilization("c123");
      expect(result).toBe(0);
    });

    it("should return correct utilization percentage", async () => {
      jest.spyOn(cardService, "getAllBalanceData").mockResolvedValue({
        availableBalance: 9750,
        creditLimit: 10000,
      });

      const result = await cardService.calculateUtilization("c123");
      expect(result).toBe(3); // (10000 - 9750) / 10000 * 100
    });
  });

  // ---------------- getCreditCardData ----------------
  describe("getCreditCardData", () => {
    it("should return null if no card data", async () => {
      cardData.singleCard.mockResolvedValue({ results: [] });
      const result = await cardService.getCreditCardData({ id: "c1", accountId: "acc1" });
      expect(result).toBeNull();
    });

    it("should return credit card data for valid card", async () => {
      const mockCard = { id: "1", accountId: "acc123" };

      cardData.singleCard.mockResolvedValue({
        results: [{
          card_network: "VISA",
          card_type: "credit",
          currency: "GBP",
          display_name: "Personal Visa",
          name_on_card: "Kumar",
          partial_card_number: "5678",
          valid_from: "01/23",
          valid_to: "12/28",
          provider: { provider_id: "prov123" },
        }],
      });

      prisma.card.update.mockResolvedValue({});

      const result = await cardService.getCreditCardData(mockCard);

      expect(result).toEqual(expect.objectContaining({
        cardNetwork: "VISA",
        type: "credit",
        lastFour: "5678",
      }));
    });
  });
});
