import express from "express";
import {dueDate, paymentMake } from "../controllers/reminder.controller.js";

const reminderRouter = express.Router();



//payment reminder
reminderRouter.post("/reminders", paymentMake);
//due date notification
reminderRouter.post("/reminders/due-date-notification", dueDate);
//payment made


export default reminderRouter;