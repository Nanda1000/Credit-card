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
      const err = new Error("Invalid card number");
      err.statusCode = 400;
      throw err;
    }

    if (!validationUtils.isValidDate(validTo)) {
      const err = new Error("Card expired or invalid date");
      err.statusCode = 400;
      throw err;
    }

    if (!validationUtils.isPositiveNumber(accountId)) {
      const err = new Error("Invalid accountId");
      err.statusCode = 400;
      throw err;
    }

    const maskedNumber = validationUtils.maskCardNumber(cardNumber);
    const lastFour = cardNumber.slice(-4);
    const parseMMYYYY = (v) => {
      if (!v || typeof v !== 'string') return null;
      const [m, y] = v.split('/').map(Number);
      if (!m || !y) return null;
      return new Date(y, m - 1, 1);
    };

    return prisma.card.create({
      data: {
        userId,
        bankName,
        cardType,
        cardNetwork,
        accountId: accountId !== undefined && accountId !== null ? String(accountId) : null,
        providerId,
        displayName,
        nameOnCard,
        maskedNumber,
        lastFour,
        validFrom: parseMMYYYY(validFrom),
        validTo: parseMMYYYY(validTo),
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
    if (!cardId) {
      const err = new Error("Card ID is required");
      err.statusCode = 400;
      throw err;
    }
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });
    if (!card) {
      const err = new Error("Card not found");
      err.statusCode = 404;
      throw err;
    }
    // If caller provided a userId, enforce ownership
    if (userId !== undefined && userId !== null) {
      if (card.userId !== userId) {
        const err = new Error("Unauthorized");
        err.statusCode = 403;
        throw err;
      }
    }
    return card;
  },

  /**
   * Update static card metadata (not balances)
   */
  async updateCard(cardId, userId, update) {
    if (!cardId || !userId || !update) {
      const err = new Error("User ID, Card ID and update data are required");
      err.statusCode = 400;
      throw err;
    }
    await this.getCardById(cardId, userId); // ensure ownership
    return prisma.card.update({
      where: { id: cardId },
      data: update,
    });
  },

  /**
   * Delete card (metadata only)
   */
  async deleteCard(cardId, userId) {
    if (!cardId || !userId) {
      const err = new Error("User ID and Card ID are required");
      err.statusCode = 400;
      throw err;
    }
    await this.getCardById(cardId, userId); // ensure ownership
    return prisma.card.delete({
      where: { id: cardId },
    });
  },

  /**
   * Fetch live balance + due date from TrueLayer.
   */
  async getAllBalanceData(cardId) {
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) return null;

    const response = await cardData.balanceCard({ accountId: card.accountId });
    const data = response.results?.[0];
    if (!data) return null;

    await prisma.card.update({
      where: { id: card.id },
      data: {
        availableBalance: data.available,
        creditLimit: data.credit_limit,
        lastStatementBalance: data.last_statement_balance,
        lastStatementDate: data.last_statement_date ? new Date(data.last_statement_date) : null,
        dueAmount: data.payment_due,
        dueDate: data.payment_due_date ? new Date(data.payment_due_date) : null,
      },
    });

    return {
      availableBalance: data.available,
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
  async calculateUtilization(cardId) {
    const balanceData = await this.getAllBalanceData(cardId);
    if (!balanceData) return 0;

    const { creditLimit, availableBalance } = balanceData;
    if (!creditLimit || creditLimit <= 0) return 0;

    const used = creditLimit - availableBalance;
    return Math.round((used / creditLimit) * 100);
  },

  /**
   * Fetch static credit card info from TrueLayer (not balances).
   */
  async getCreditCardData(cardId) {
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) return null;

    const response = await cardData.singleCard({ accountId: card.accountId });
    const data = response.results?.[0];
    if (!data) return null;

    await prisma.card.update({
      where: { id: card.id },
      data: {
        cardNetwork: data.card_network,
        cardType: data.card_type,
        displayName: data.display_name,
        nameOnCard: data.name_on_card,
        lastFour: data.partial_card_number,
        validFrom: data.valid_from ? new Date(data.valid_from) : null,
        validTo: data.valid_to ? new Date(data.valid_to) : null,
        providerId: data.provider?.provider_id,
      },
    });

    return {
      cardNetwork: data.card_network,
      type: data.card_type,
      displayName: data.display_name,
      nameOnCard: data.name_on_card,
      lastFour: data.partial_card_number,
      validFrom: data.valid_from,
      validTo: data.valid_to,
      providerId: data.provider?.provider_id,
    };
  },
};
