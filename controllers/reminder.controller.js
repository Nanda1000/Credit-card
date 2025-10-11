

import { cardService } from "../services/card.service.js";
import { reminder } from "../services/reminder.service.js";

// POST /reminders/:cardId
export const paymentMake = async (req, res, next) => {
  try {
    const { cardId } = req.params; // ✅ Fix: from params, not body
    const { userId, email, dueDate } = req.body;

    // 1️⃣ Verify the card exists
    const card = await cardService.getCardById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // 2️⃣ Verify due date
    if (!dueDate) {
      return res.status(400).json({ message: "Due date is required" });
    }

    // 3️⃣ Schedule reminder
    await reminder.scheduleAllReminders(cardId, userId, email);

    res.status(200).json({
      message: "Reminder scheduled successfully",
      userId,
      cardId,
      email,
    });
  } catch (err) {
    console.error("Controller Error:", err);
    next(err);
  }
};

// GET /reminders/:cardId/dueDate
export const dueDate = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { userId, email } = req.body;

    const dueDate = await reminder.paymentDueDate(cardId, userId);
    await reminder.sendReminderEmail(email, cardId, dueDate);

    res.status(200).json({
      message: "Due date notification sent successfully",
      id: cardId,
      dueDate,
      email,
    });
  } catch (err) {
    console.error("Controller Error:", err);
    next(err);
  }
};


//rewards & offers

export const rewardsOffers = async(req, res, next)=>{
    try{

    }catch(err){
        next(err);
    }
};

