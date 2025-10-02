import Queue from "bull";
import { reminder } from "../reminder.service";

// create a queue for reminders
export const reminderQueue = new Queue("reminders", {
    redis: { host: "127.0.0.1", port: 6379 },
});

// process the queue
reminderQueue.process(async (job) => {
    const {userEmail, cardId, dueDate} = job.data;
    console.log("Processing reminder job:", job.id);
    await reminder.sendReminderEmail(userEmail, cardId, dueDate);
});

// add a job to the queue (can be called from anywhere in the app)
export const addReminderJob = async (data, reminderDate) => {
    await reminderQueue.add({data}, { delay: reminderDate - Date.now() });
    console.log("Added reminder job to the queue");
};