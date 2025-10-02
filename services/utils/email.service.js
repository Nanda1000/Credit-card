import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send card payment due email
 */
export async function sendDueEmail(userEmail, dueDate) {
  await transporter.sendMail({
    from: `"Card Reminder" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Card Payment Reminder",
    text: `Your card payment is due on ${dueDate.toDateString()}.`,
  });
}

/**
 * Send overdue email
 */
export async function sendOverdueEmail(userEmail, dueDate) {
  await transporter.sendMail({
    from: `"Card Reminder" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Card Payment Overdue",
    text: `Your card payment was due on ${dueDate.toDateString()}. Please pay immediately.`,
  });
}

/**
 * Send rewards email
 */
export async function sendRewards(userEmail) {
  await transporter.sendMail({
    from: `"Card Reminder" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Rewards Available",
    text: "Check out your rewards!",
  });
}

/**
 * Send offers email
 */
export async function sendOffers(userEmail) {
  await transporter.sendMail({
    from: `"Card Reminder" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Exclusive Offers",
    text: "Don't miss out on our exclusive offers!",
  });
}
