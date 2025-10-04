import { addCard, deleteCard, getCard, getUtilization, updateCard, getAllCards, getCardBalance } from "../controllers/creditcard.controller";
import express from "express";


const cardRouter = express.Router();

cardRouter.post("/users/:userId/cards", addCard);
cardRouter.get("/cards/:id", getCard);
cardRouter.put("/cards/:id", updateCard);
cardRouter.get("/cards/:id/utilization", getUtilization);
cardRouter.delete("/cards/:id", deleteCard);
cardRouter.get("/users/:userId/cards", getAllCards);
cardRouter.get("/users/:userId/cards/balance", getCardBalance);

export default cardRouter;
