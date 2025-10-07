import { addCard, deleteCard, getCard, getUtilization, updateCard, getAllCards, getCardsBalance } from "../controllers/creditcard.controller.js";
import express from "express";


const cardRouter = express.Router();

cardRouter.post("/users/:userId/cards", addCard);
cardRouter.get("/cards/:id", getCard);
cardRouter.patch("/cards/:id", updateCard);
cardRouter.get("/cards/:id/utilization", getUtilization);
cardRouter.delete("/cards/:id", deleteCard);
cardRouter.get("/users/:userId/cards", getAllCards);
cardRouter.get("/users/:userId/cards/balance", getCardsBalance);

export default cardRouter;
