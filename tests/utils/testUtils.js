// tests/utils/testUtils.js
import { prisma } from "../../database/prisma.js";

export async function seedUserWithCard() {
  const user = await prisma.user.create({
    data: {
      email: "demo@test.com",
      password: "demo",
      accessToken: "tok",
      refreshToken: "ref",
      tokenexpiry: new Date(),
    },
  });

  const card = await prisma.card.create({
    data: {
      userId: user.id,
      bankName: "Barclays",
      cardType: "MasterCard",
      displayName: "Seeded Card",
      creditLimit: 5000,
      availableBalance: 3749,
      paymentDueDate: new Date("2025-12-25"),
    },
  });

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      cardId: card.id,
      amount: 5000,
      currency: 'GBP',
      status: "success",
      cardBank: "Barclays",
      idempotencyKey: "test-idempotency-key",
      redirectUrl: "https://example.com/redirect",
    },
  });

  const reminder = await prisma.reminder.create({
    data: {
      userId: user.id,
      cardId: card.id,
      message: "Test reminder message",
      dueDate: new Date("2025-12-25"),
      reminderDate: new Date("2025-12-22"),
      status: "Pending",
      notifyVia: ["email"],
    },
  });

  return { user, card, payment, reminder };
}