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
      authUrl: "authUrl"
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
    },
  });

  const payment = await prisma.payment.create({
    data: {
      cardId: card.id,
      amount: 5000,
      currency: 'GBP',
      method: "redirect" || "pisp",
      idempotencyKey,
      providerPaymentId: 123,
      status: "success",
    },
  });

  const reminder = await prisma.reminder.create({
    data: {
      cardId: card.id,
      dueDate: "12/25"
    }
  });

  return { user, card, payment, reminder };
}
