import { addCard, deleteCard, getCard, getUtilization, updateCard } from "../controllers/creditcard.controller";
import express from "express";


const cardRouter = express.Router();

cardRouter.post("/cards", addCard);
cardRouter.get("/cards/:id", getCard);
cardRouter.put("/cards/:id", updateCard);
cardRouter.post("/cards/:id/utilization", getUtilization);
cardRouter.delete("/cards/:id", deleteCard);

export default cardRouter;
