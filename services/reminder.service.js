import axios from "axios";
import prisma from "../prisma/client.js"; // assuming you have a prisma client

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

        // Step 3: Either return DB due date (preferred) or refresh from provider
        let dueDate = card.dueDate;

        // If you want to sync with TrueLayer:
        if (!dueDate) {
            const providerResp = await axios.get(
                `https://api.truelayer.com/data/v1/cards/${card.providerCardId}`,
                { headers: { Authorization: `Bearer ${process.env.TRUELAYER_ACCESS_TOKEN}` } }
            );
            dueDate = providerResp.data?.results?.[0]?.due_date;
        }

        if (!dueDate) throw new Error("Due date unavailable");
        return new Date(dueDate);
    },

    /**
     * Send email notification (stubbed, integrate with SendGrid/Mailgun)
     */
    async sendReminderEmail(userEmail, cardId, dueDate) {
        console.log(
            `📧 Sending reminder to ${userEmail} for card ${cardId} with due date ${dueDate}`
        );
        // TODO: replace with sendgrid/mailgun call
    },

    /**
     * Schedule reminder (store job in DB or push to queue)
     */
    async scheduleReminder(cardId, userId, userEmail) {
        const dueDate = await this.paymentDueDate(cardId, userId);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - 3);

        // Store in DB for scheduler to pick up
        await prisma.reminder.create({
            data: {
                userId,
                cardId,
                dueDate,
                reminderDate,
                notifyVia: ["email"], // could extend with push/sms
            },
        });

        console.log(`✅ Reminder scheduled on ${reminderDate} for user ${userEmail}`);
    },

    /**
     * Check all reminders due today and send notifications
     * Should be triggered daily by cron/queue worker
     */
    async checkAndSendReminders() {
        const today = new Date();

        // Fetch reminders due today
        const reminders = await prisma.reminder.findMany({
            where: {
                reminderDate: {
                    lte: today, // reminder date <= today
                },
                sent: false,
            },
            include: { user: true, card: true },
        });

        for (const r of reminders) {
            await this.sendReminderEmail(r.user.email, r.cardId, r.dueDate);

            // Mark as sent
            await prisma.reminder.update({
                where: { id: r.id },
                data: { sent: true },
            });
        }
    },
};
