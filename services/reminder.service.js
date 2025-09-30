import axios from "axios";

export const reminder = {
    async paymentDueDate(cardId, userId){
        // Fetch card details to get due date
        const card = await axios.get(`https://api.truelayer.com/data/v1/cards/${cardId}`, {
            headers: {
                Authorization: `Bearer ${process.env.TRUELAYER_ACCESS_TOKEN}`
            }
        });
        if (!card) throw new Error("Card not found");
        if (card.userId !== userId) throw new Error("Unauthorized");
        return card.data.due_date;
    }, 

    async sendReminderEmail(userEmail, cardId, dueDate) {
        // Integrate with an email service like SendGrid, Mailgun, etc.
        console.log(`Sending reminder to ${userEmail} for card ${cardId} with due date ${dueDate}`);
    }, 

    async scheduleReminder(cardId, userId, userEmail) {
        const dueDate = await this.paymentDueDate(cardId, userId);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before due date
    },

    async checkAndSendReminders() {
        // This function would be called by a scheduler (like cron) daily
        const today = new Date();
        // Fetch all cards and their due dates from your database
        const cards = []; // Replace with actual DB call
        for (const card of cards) {
            const dueDate = new Date(card.dueDate);
            const reminderDate = new Date(dueDate);
            reminderDate.setDate(reminderDate.getDate() - 3);
            if (today.toDateString() === reminderDate.toDateString()) {
                await this.sendReminderEmail(card.userEmail, card.id, dueDate);
            }
        }
    }
};
