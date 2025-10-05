import axios from "axios";
import { prisma } from "../database/prisma.js"; 
import { cardData } from "./carddata.service.js";
import { reminderQueue } from "../queue/reminder.queue.js";
import * as emailservice from "../services/utils/email.service.js";


export const reminder = {
    /**
     * Get due date for a card from DB + optional provider (TrueLayer)
     */
    async paymentDueDate(cardId, userId) {
        // Step 1: Fetch card from DB
        const card = await prisma.card.findUnique({
            where: { id: cardId },
        });
        if (!card) throw new Error("Card not found");

        // Step 2: Check ownership
        if (card.userId !== userId) {
            throw new Error("Unauthorized access to this card");
        }

        let dueDate = card.paymentDueDate;
        if (!dueDate) {
            const response = await cardData.balanceCard({ accountId: card.accountId, userId });

            const data = response.results?.[0];
            if (!data) return null;
            
            // Step 3: Either return DB due date (preferred) or refresh from provider
            dueDate = data.payment_due_date;
            await prisma.card.update({
                where: { id: cardId },
                data: { paymentDueDate: dueDate },
            });
        }
        return dueDate;
    },
    

    /**
     * Send email notification (stubbed, integrate with SendGrid/Mailgun)
     */
    async sendReminderEmail(userEmail, cardId, dueDate) {
        console.log(
            `Sending reminder to ${userEmail} for card ${cardId} with due date ${dueDate}`
        );
        // TODO: replace with sendgrid/mailgun call
    },


    /**
     * Schedule reminder (store job in DB or push to queue)
     */
    async scheduleAllReminders() {
    // Step 1: Get all cards with dueDate
    const cards = await prisma.card.findMany({
        where: { paymentDueDate: { not: null } },
        include: { user: true },
    });

    // Step 2: Loop through cards
    for (const card of cards) {
        const dueDate = new Date(card.paymentDueDate);
        const reminderOffsets = [-3, -1, 0, 1]; // 3d before, 1d before, same day, 1d after

        for (const offset of reminderOffsets) {
            const reminderDate = new Date(dueDate);
            if (offset >= 0) {
                reminderDate.setDate(dueDate.getDate() + offset);

                // Step 3: Avoid duplicates
                const existing = await prisma.reminder.findFirst({
                    where: { cardId: card.id, reminderDate },
                });
                if (existing) continue;

                // Step 4: Save reminder
                await prisma.reminder.create({
                    data: {
                        userId: card.userId,
                        cardId: card.id,
                        dueDate,
                        reminderDate,
                        notifyVia: ["email"],
                        sent: false,
                    },
                });
                // Send mail
                await emailservice.sendOverdueEmail(card.user.email, dueDate);

            }

            else{
                reminderDate.setDate(dueDate.getDate() + offset);

                // Step 3: Avoid duplicates
                const existing = await prisma.reminder.findFirst({
                    where: { cardId: card.id, reminderDate },
                });
                if (existing) continue;

                // Step 4: Save reminder
                await prisma.reminder.create({
                    data: {
                        userId: card.userId,
                        cardId: card.id,
                        dueDate,
                        reminderDate,
                        notifyVia: ["email"],
                        sent: false,
                    },
                });
                // Send mail
                await emailservice.sendDueEmail(card.user.email, dueDate);

            }

            console.log(
                `Reminder created for ${card.user.email} - Card ${card.id} on ${reminderDate}`
            );
        }
    }
    },

    /**
     *  

export const reminder = {
  async scheduleReminder(cardId, userId, userEmail, dueDate) {
    const reminderTimes = [
      new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before
      new Date(dueDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day before
      new Date(dueDate),                                     // on the day
      new Date(dueDate.getTime() + 1 * 24 * 60 * 60 * 1000)  // 1 day after
    ];

    for (const reminderDate of reminderTimes) {
      if (reminderDate > new Date()) { 
        await reminderQueue.add(
          { userEmail, cardId, dueDate },
          { delay: reminderDate - Date.now(), attempts: 3 } // retry up to 3 times
        );
        console.log(`Job scheduled for ${reminderDate}`);
      }
    }
  }
};

     */



    /**
     * Check all reminders due today and send notifications
     * Should be triggered daily by cron/queue worker
     */
    async checkAndSendReminders() {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const reminders = await prisma.reminder.findMany({
        where: {
            reminderDate: { gte: start, lte: end },
            sent: false,
        },
        include: { user: true, card: true },
    });

    for (const r of reminders) {
        await this.sendReminderEmail(r.user.email, r.cardId, r.dueDate);

        await prisma.reminder.update({
            where: { id: r.id },
            data: { sent: true },
        });
    }
    }

};
