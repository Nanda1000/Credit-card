// services/card.service.js
import { prisma } from "../database/prisma.js";
import { cardData } from "./carddata.service.js";
import { validationUtils } from "./utils/validation.js";

export const cardService = {
  async createCard(userId, cardDataInput) {
    const { number, limit, balance, dueDate } = cardDataInput;

    if (!validationUtils.isValidCardNumber(number)) {
      throw new Error("Invalid card number");
    }

    const masked = validationUtils.maskCardNumber(number);

    return prisma.card.create({
      data: {
        userId,
        cardNumber: masked, // matches schema
        limit,
        balance,
        dueDate,
      },
    });
  },

  async getCardsByUser(userId) {
    // Optionally filter by userId if cardData.cardInfo returns all cards
    const cards = await cardData.cardInfo({ userId });
    // If cardData.cardInfo returns all cards, filter here:
    // return cards.filter(card => card.userId === userId);
    return cards;
  },

  async getCardById(cardId, userId) {
    const card = await cardData.singleCard({ accountId: cardId }); // use accountId as per carddata.service.js
    if (!card) throw new Error("Card not found");
    if (card.userId !== userId) throw new Error("Unauthorized");
    return card;
  },

  async updateCard(cardId, userId, update) {
    await this.getCardById(cardId, userId); // ownership check
    return prisma.card.update({
      where: { id: cardId },
      data: update,
    });
  },

  async deleteCard(cardId, userId) {
    await this.getCardById(cardId, userId); // ownership check
    return prisma.card.delete({ where: { id: cardId } });
  },

  async calculateUtilization(card) {
    const cardbalanceData = await cardData.balanceCard({ accountId: card.id }); // use accountId
    // Use correct fields from API response
    const balance = cardbalanceData.balance || cardbalanceData.current_balance || 0;
    const limit = card.limit || cardbalanceData.credit_limit || 0;
    if (!balance || !limit || limit <= 0) return 0;
    return Math.round((balance / limit) * 100);
  },
};
