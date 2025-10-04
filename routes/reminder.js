import express from "express";
import {dueDate, paymentMake, rewardsOffers } from "../controllers/reminder.controller.js";
import { reminder } from "../services/reminder.service.js";

const reminderRouter = express.Router();



// Create reminder
reminderRouter.post("/reminders", paymentMake);
// List reminders
reminderRouter.get("/reminders", dueDate); // Replace with listReminders controller when available
// Update reminder
reminderRouter.put("/reminders/:id", rewardsOffers); // Replace with updateReminder controller when available
// Delete reminder
reminderRouter.delete("/reminders/:id", rewardsOffers); // Replace with dismissReminder controller when available


export default reminderRouter;