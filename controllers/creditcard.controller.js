import * as cardService from "../services/card.service.js";

// Add new card
export const addCard = async (req, res, next) => {
  try {
    const { userId, bankName, cardType, cardNumber, limit, balance } = req.body;

    const newCard = await cardService.createCard(userId, {
      bankName,
      cardType,
      cardNumber,
      limit,
      balance,
    });

    res.status(201).json(newCard);
  } catch (err) {
    if (err.message.includes("already added")) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

// Card utilization
export const getUtilization = async (req, res, next) => {
  try {
    const { cardNumber } = req.body;

    const card = await cardService.getCardById(cardNumber);
    if (!card) {
      return res.status(404).json({ error: "No card found under these details" });
    }

    const utilization = cardService.calculateUtilization(card);
    res.json({ utilization });
  } catch (err) {
    next(err);
  }
};

// Get card details
export const getCard = async (req, res, next) => {
  try {
    const { cardNumber } = req.body;

    const card = await cardService.getCardById(cardNumber);
    if (!card) {
      return res.status(404).json({ error: "No card found under these details" });
    }

    res.json(card);
  } catch (err) {
    next(err);
  }
};

// Update card
export const updateCard = async (req, res, next) => {
  try {
    const { bankName, cardType, cardNumber, limit, balance } = req.body;

    const card = await cardService.getCardById(cardNumber);
    if (!card) {
      return res.status(404).json({ error: "No card found under this card number to update" });
    }

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
    const { cardNumber } = req.body;

    const card = await cardService.getCardById(cardNumber);
    if (!card) {
      return res.status(404).json({ error: "No card found under this card number to delete" });
    }

    await cardService.deleteCard(cardNumber);
    res.status(204).send(); // 204 = No Content
  } catch (err) {
    next(err);
  }
};

// Get all cards
export const getAllCards = async (req, res, next)=>{
  try{
    const {userId} = req.params
    const getCards = await cardService.getCardsByUser(userId);
    if(!getCards) {
      return res.status(404).json({error: "No cards associated with this user"})
    }
    res.json(getCards);
  }catch(err){
    next(err);
  }
};
