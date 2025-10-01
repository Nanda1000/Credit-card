import * as cardService from "../services/card.service.js";

// Add new card
export const addCard = async (req, res, next) => {
  try {
    const {userId} = req.params;
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
    if (err.message.includes("already added")) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

// Card utilization
export const getUtilization = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;
  
    const card = await cardService.getCardById(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ error: "This card does not belong to the user" });
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
    const cardId = req.params.id;
    const userId = req.user.id;
  
    const card = await cardService.getCardById(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ error: "This card does not belong to the user" });
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
    const cardId = req.params.id;
    const userId = req.user.id;
  
    const card = await cardService.getCardById(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ error: "This card does not belong to the user" });
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
    const cardId = req.params.id;
    const userId = req.user.id;
  
    const card = await cardService.getCardById(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ error: "This card does not belong to the user" });
    }

    await cardService.deleteCard(cardId);
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

// get balance data
export const getcardBalance = async(req, res, next)=>{
  try{
    const {userId} = req.params;
    const getCardBalance = await cardService.getAllBalanceData(userId);
    if(!getCardBalance) {
      return res.status(404).json({error: "No data acquired from the server"});
    }
    res.json(getCardBalance);
  }catch(err){
    next(err);
  }
};


