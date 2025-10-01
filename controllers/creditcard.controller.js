import * as cardService from "../services/card.service.js";

// Add new card
export const addCard = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      cardNetwork,
      type,
      curr,
      cardname,
      name,
      lastfour,
      validfrom,
      validto,
      prov
    } = req.body;

    const newCard = await cardService.getCreditCard(userId, {
      cardNetwork,
      type,
      curr,
      cardname,
      name,
      lastfour,
      validfrom,
      validto,
      prov
    });

    res.status(201).json(newCard);
  } catch (err) {
    next(err); // ✅ handled by central error handler
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
    const { bankName, cardType, cardNumber, limit, balance } = req.body;
    const cardId = req.params.id;
    const userId = req.user.id;

    // ✅ ownership check
    await cardService.getCardById(cardId, userId);

    const updatedCard = await cardService.updateCard(cardNumber, {
      bankName,
      cardType,
      limit,
      balance,
    });

    res.json(updatedCard);
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

// Get all balance data
export const getCardBalance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const balances = await cardService.getAllBalanceData(userId);

    if (!balances) {
      return res.status(404).json({ error: "No balance data available" });
    }

    res.json(balances);
  } catch (err) {
    next(err);
  }
};
