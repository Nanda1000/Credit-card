// tests/utils/testUtils.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
      balance: 3749,
    },
  });



  return { user, card };
}
