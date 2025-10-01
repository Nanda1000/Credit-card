// services/card.service.js
import { prisma } from "../database/prisma.js";
import { cardData } from "./carddata.service.js";
import { validationUtils } from "./utils/validation.js";

export const cardService = {
  async createCard(userId, cardDataInput) {
    const { userId, bankName, cardType, cardNumber, limit, balance } = cardDataInput;

    if (!validationUtils.isValidCardNumber(cardNumber)) {
      throw new Error("Invalid card number");
    }

    const masked = validationUtils.maskCardNumber(cardNumber);

    return prisma.card.create({
      data: {
        userId,
        bankName,
        cardType,
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
  const cardbalanceData = await cardData.balanceCard({ accountId: card.id });
  // TrueLayer returns { results: [ ... ] }
  const data = cardbalanceData.results && cardbalanceData.results[0];
  if (!data) return 0;
  const balance = data.current;
  const limit = data.credit_limit;
  if (!balance || !limit || limit <= 0) return 0;
  return Math.round((balance / limit) * 100);
  },

  async getDueDate(card) {
    const cardbalanceData = await cardData.balanceCard({ accountId: card.id });
    const data = cardbalanceData.results && cardbalanceData.results[0];
    if (!data) return null;
    const dueDate = data.payment_due_date;
    return dueDate;
  },

  async getAllBalanceData(card) {
    const cardbalanceData = await cardData.balanceCard({ accountId: card.id });
    const data = cardbalanceData.results && cardbalanceData.results[0];
    if(!data) return null;
    const avl_balance = data.available;
    const curr = data.currency;
    const limit = data.credit_limit;
    const lastBal = data.last_statement_balance;
    const lastDate = data.last_statement_date; // last statement date of this credit card
    const dueAmount = data.payment_due;
    const dueDate = data.payment_due_date;
    return { avl_balance, curr, limit, lastBal, lastDate, dueAmount, dueDate };

  },

  async getCreditCardData(user) {
    const cardcreditData = await cardData.singleCard({accountId: user.id});
    const data = cardcreditData.results && cardcreditData.results[0];
    if(!data) return null;
    const cardNetwork = data.card_network;
    const type = data.card_type;
    const curr = data.currency;
    const cardname = data.display_name;
    const name  = data.name_on_card;
    const lastfour = data.partial_card_number;
    const validfrom = data.valid_from;
    const validto = data.valid_to;
    const prov = data.provider.provider_id;
    return { cardNetwork, type, curr, cardname, name, lastfour, validfrom, validto, prov };

  }
};
