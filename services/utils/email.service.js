// Simple test-friendly email service stub.
// For production, replace this file with a real implementation using nodemailer
// or another provider, or install nodemailer and implement a transporter.

export async function sendDueEmail(userEmail, dueDate) {
  // In tests we don't send real emails — just log.
  if (process.env.NODE_ENV === 'test') {
    // keep output minimal for tests
    // console.log(`[stub] sendDueEmail to ${userEmail} due ${dueDate}`);
    return Promise.resolve();
  }

  // Production fallback: attempt to use nodemailer if available.
  try {
    const { default: nodemailer } = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Card Reminder" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Card Payment Reminder',
      text: `Your card payment is due on ${dueDate.toDateString()}.`,
    });
  } catch (err) {
    console.warn('sendDueEmail failed (nodemailer missing or error)');
  }
}

export async function sendOverdueEmail(userEmail, dueDate) {
  if (process.env.NODE_ENV === 'test') return Promise.resolve();
  try {
    const { default: nodemailer } = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Card Reminder" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Card Payment Overdue',
      text: `Your card payment was due on ${dueDate.toDateString()}. Please pay immediately.`,
    });
  } catch (err) {
    console.warn('sendOverdueEmail failed (nodemailer missing or error)');
  }
}

export async function sendRewards(userEmail) {
  if (process.env.NODE_ENV === 'test') return Promise.resolve();
  try {
    const { default: nodemailer } = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Card Reminder" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Rewards Available',
      text: 'Check out your rewards!',
    });
  } catch (err) {
    console.warn('sendRewards failed (nodemailer missing or error)');
  }
}

export async function sendOffers(userEmail) {
  if (process.env.NODE_ENV === 'test') return Promise.resolve();
  try {
    const { default: nodemailer } = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Card Reminder" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Exclusive Offers',
      text: "Don't miss out on our exclusive offers!",
    });
  } catch (err) {
    console.warn('sendOffers failed (nodemailer missing or error)');
  }
}
