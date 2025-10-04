import * as cardService from "../services/card.service.js";
import { reminder } from "../services/reminder.service.js";

// Add new card
export const addCard = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      cardNetwork,
      cardType,
      displayName,
      nameOnCard,
      lastFour,
      validFrom,
      validTo,
      providerId,
      accountId
    } = req.body;

    // 1. Store card in DB
    const newCard = await cardService.createCard(userId, {
      bankName: displayName,
      cardType,
      cardNetwork,
      accountId,
      providerId,
      cardNumber: lastFour,
      displayName,
      nameOnCard,
      validFrom,
      validTo,
    });

    // 2. Fetch live balance
    const balanceData = await cardService.getAllBalanceData(newCard);

    // 3. Schedule reminder if dueDate exists
    if (balanceData?.dueDate) {
      await reminder.scheduleAllReminders(
        newCard.id,
        userId,
        req.user.email,
        new Date(balanceData.dueDate)
      );
    }

    res.status(201).json({ ...newCard, balance: balanceData });
  } catch (err) {
    next(err);
  }
};


// Card utilization
export const getUtilization = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;

    const card = await cardService.getCardById(cardId, userId); // ✅ ownership checked
    const utilization = cardService.calculateUtilization(card);

    res.json({ utilization });
  } catch (err) {
    next(err);
  }
};

// Get card details
export const getCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;

    const card = await cardService.getCardById(cardId, userId); // ✅ ownership checked
    res.json(card);
  } catch (err) {
    next(err);
  }
};

// Update card
export const updateCard = async (req, res, next) => {
  try {
    const { creditLimit, balance } = req.body;
    const cardId = req.params.id;
    const userId = req.user.id;

    const updatedCard = await cardService.updateCard(cardId, userId, {
      creditLimit,
      balance,
    });

    const balanceData = await cardService.getAllBalanceData(updatedCard);

    if (balanceData?.dueDate) {
      await reminder.scheduleAllReminders(
        updatedCard.id,
        userId,
        req.user.email,
        new Date(balanceData.dueDate)
      );
    }

    res.json({ ...updatedCard, balance: balanceData });
  } catch (err) {
    next(err);
  }
};


// Delete card
export const deleteCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;

    // ✅ ownership check
    await cardService.getCardById(cardId, userId);

    await cardService.deleteCard(cardId);
    res.status(204).send(); // No Content
  } catch (err) {
    next(err);
  }
};

// Get all cards by user
export const getAllCards = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cards = await cardService.getCardsByUser(userId);

    if (!cards || cards.length === 0) {
      return res.status(404).json({ error: "No cards associated with this user" });
    }

    res.json(cards);
  } catch (err) {
    next(err);
  }
};

// Get all balances
export const getCardBalance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cards = await cardService.getCardsByUser(userId);

    if (!cards || cards.length === 0) {
      return res.status(404).json({ error: "No cards associated with this user" });
    }

    const balances = await Promise.all(
      cards.map(async (card) => {
        const balance = await cardService.getAllBalanceData(card);
        return { cardId: card.id, ...balance };
      })
    );

    res.json(balances);
  } catch (err) {
    next(err);
  }
};