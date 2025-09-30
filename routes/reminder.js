import express from "express";
import {dueDate, paymentMake } from "../controllers/reminder.controller.js";

const reminderRouter = express.Router();



//payment reminder
reminderRouter.post("/payment-reminder", paymentMake);
//due date notification
reminderRouter.post("/due-date-notification", dueDate);
//payment made


export default reminderRouter;