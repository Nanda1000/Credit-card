import { addCard, deleteCard, getCard, getUtilization, updateCard } from "../controllers/creditcard.controller";
import express from "express";


const cardRouter = express.Router();

cardRouter.post("/api/add", addCard);
cardRouter.get("/get", getCard);
cardRouter.put("/update", updateCard);
cardRouter.post("/utilization", getUtilization);
cardRouter.delete("/delete", deleteCard);

export default cardRouter;
