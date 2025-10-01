// services/card.service.js
import { prisma } from "../database/prisma.js";
import { cardData } from "./carddata.service.js"; // wrapper for TrueLayer API
import { validationUtils } from "./utils/validation.js";

export const cardService = {
  /**
   * Create a new card entry for user (store metadata only).
   */
  async createCard(userId, cardInput) {
    const {
      bankName,
      cardType,
      cardNetwork,
      accountId,
      providerId,
      cardNumber,
      displayName,
      nameOnCard,
      validFrom,
      validTo,
    } = cardInput;

    if (!validationUtils.isValidCardNumber(cardNumber)) {
      throw new Error("Invalid card number");
    }

    if (!validationUtils.isValidDate(validTo)) {
      throw new Error("Card expired or invalid date");
    }

    if (!validationUtils.isPositiveNumber(accountId)) {
      throw new Error("Invalid accountId");
    }

    const maskedNumber = validationUtils.maskCardNumber(cardNumber);
    const lastFour = cardNumber.slice(-4);

    return prisma.card.create({
      data: {
        userId,
        bankName,
        cardType,
        cardNetwork,
        accountId,
        providerId,
        displayName,
        nameOnCard,
        maskedNumber,
        lastFour,
        validFrom,
        validTo,
      },
    });
  },

  /**
   * Get all cards owned by a user (metadata only).
   */
  async getCardsByUser(userId) {
    if (!userId) {
    throw new Error("User ID is required");
  }
    return prisma.card.findMany({
      where: { userId },
    });
  },

  /**
   * Get single card metadata, verify ownership.
   */
  async getCardById(cardId, userId) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });
    if (!card) throw new Error("Card not found");
    if (card.userId !== userId) throw new Error("Unauthorized");
    return card;
  },

  /**
   * Update static card metadata (not balances).
   */
  async updateCard(cardId, userId, update) {
    await this.getCardById(cardId, userId); // ensure ownership
    return prisma.card.update({
      where: { id: cardId },
      data: update,
    });
  },

  /**
   * Delete card (metadata only).
   */
  async deleteCard(cardId, userId) {
    await this.getCardById(cardId, userId); // ensure ownership
    return prisma.card.delete({
      where: { id: cardId },
    });
  },

  /**
   * Fetch live balance + due date from TrueLayer.
   */
  async getAllBalanceData(card) {
    const response = await cardData.balanceCard({ accountId: card.accountId });
    const data = response.results?.[0];
    if (!data) return null;

    return {
      availableBalance: data.available,
      currency: data.currency,
      creditLimit: data.credit_limit,
      lastStatementBalance: data.last_statement_balance,
      lastStatementDate: data.last_statement_date,
      dueAmount: data.payment_due,
      dueDate: data.payment_due_date,
    };
  },

  /**
   * Calculate utilization % (live).
   */
  async calculateUtilization(card) {
    const balanceData = await this.getAllBalanceData(card);
    if (!balanceData) return 0;

    const { creditLimit, availableBalance } = balanceData;
    if (!creditLimit || creditLimit <= 0) return 0;

    const used = creditLimit - availableBalance;
    return Math.round((used / creditLimit) * 100);
  },

  /**
   * Fetch static credit card info from TrueLayer (not balances).
   */
  async getCreditCardData(card) {
    const response = await cardData.singleCard({ accountId: card.accountId });
    const data = response.results?.[0];
    if (!data) return null;

    return {
      cardNetwork: data.card_network,
      type: data.card_type,
      currency: data.currency,
      displayName: data.display_name,
      nameOnCard: data.name_on_card,
      lastFour: data.partial_card_number,
      validFrom: data.valid_from,
      validTo: data.valid_to,
      providerId: data.provider.provider_id,
    };
  },
};
