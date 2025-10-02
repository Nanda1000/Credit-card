import cron from 'node-cron';
import { reminder } from './reminder.service.js';

// Schedule daily job at 2 AM to set up reminders for the day

cron.schedule('0 2 * * *', async () => {
    console.log('Running daily reminder scheduling job at 2 AM');
    await reminder.scheduleAllReminders();
});

// Schedule daily job at 9 AM to send out reminders for the day

cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder sending job at 9 AM');
    await reminder.checkAndSendReminders();
});