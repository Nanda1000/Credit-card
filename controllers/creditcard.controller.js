import { cardService } from "../services/card.service.js";
import { reminder } from "../services/reminder.service.js";

// Add new card
export const addCard = async (req, res, next) => {
  try {
    const { userId: userIdParam } = req.params;
    const userId = Number(userIdParam);
    const {
      cardNetwork,
      cardType,
      displayName,
      nameOnCard,
      cardNumber,
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
      cardNumber: cardNumber || lastFour,
      displayName,
      nameOnCard,
      validFrom,
      validTo,
    });

    // 2. Fetch live balance (by card id)
  const balanceData = await cardService.getAllBalanceData(newCard.id);

    // 3. Schedule reminder if dueDate exists
    if (balanceData?.dueDate) {
      await reminder.scheduleAllReminders(
        newCard.id,
        userId,
        req.user.email,
        new Date(balanceData.dueDate)
      );
    }

    // Map DB fields to public API shape
    const response = {
      ...newCard,
      creditLimit: newCard.creditLimit,
      balance: balanceData || null,
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};


// Card utilization
export const getUtilization = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user && req.user.id ? Number(req.user.id) : undefined;

    const card = await cardService.getCardById(cardId, userId); // ✅ ownership checked
    const utilization = await cardService.calculateUtilization(cardId);

  res.json({ utilization });
  } catch (err) {
    next(err);
  }
};

// Get card details
export const getCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user && req.user.id ? Number(req.user.id) : undefined;

    const card = await cardService.getCardById(cardId, userId);
    // map db fields
    const out = {
      ...card,
      balance: card.availableBalance,
      creditLimit: card.creditLimit,
    };
    res.json(out);
  } catch (err) {
    next(err);
  }
};

// Update card
export const updateCard = async (req, res, next) => {
  try {
    // Accept API payloads using `balance` and map to DB field `availableBalance`
    const { creditLimit, balance } = req.body;
    const cardId = req.params.id;
    const userId = req.user && req.user.id ? Number(req.user.id) : undefined;

    const updatedCard = await cardService.updateCard(cardId, userId, {
      creditLimit,
      availableBalance: balance,
    });

    const balanceData = await cardService.getAllBalanceData(updatedCard.id);

    if (balanceData?.dueDate) {
      await reminder.scheduleAllReminders(
        updatedCard.id,
        userId,
        req.user.email,
        new Date(balanceData.dueDate)
      );
    }

  // If client provided a balance number, return it; otherwise return fetched balanceData
  res.json({ ...updatedCard, balance: typeof balance === 'number' ? balance : balanceData });
  } catch (err) {
    next(err);
  }
};


// Delete card
export const deleteCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = Number(req.user?.id);

    // ✅ ownership check
    await cardService.getCardById(cardId, userId);

    await cardService.deleteCard(cardId, userId);
    res.status(200).json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
};

// Get all cards by user
export const getAllCards = async (req, res, next) => {
  try {
    const { userId: userIdParam } = req.params;
    const userId = Number(userIdParam);
    const cards = await cardService.getCardsByUser(userId);

    if (!cards || cards.length === 0) {
      return res.status(404).json({ error: "No cards associated with this user" });
    }

    res.json(cards);
  } catch (err) {
    next(err);
  }
};

  // Get balances for all cards of a user
  export const getCardsBalance = async (req, res, next) => {
    try {
      const { userId: userIdParam } = req.params;
      const userId = Number(userIdParam);
      const cards = await cardService.getCardsByUser(userId);
      if (!cards || cards.length === 0) return res.status(404).json([]);

      const results = [];
      for (const c of cards) {
        const data = await cardService.getAllBalanceData(c.id);
        results.push(data);
      }
      res.json(results);
    } catch (err) {
      next(err);
    }
  };

// Get all balances of cards associated with the user like overall balance of cards and used
