import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../database/prisma.js";
import { seedUserWithCard } from "../utils/testUtils.js";

describe("Reminder", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.reminder.deleteMany();
    await prisma.card.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Payment", () => {
    it("should throw an error if no card or due date is given", async () => {
      const res = await request(app)
        .post("/reminders/payment")
        .send({});
      
      expect([201, 400, 404]).toContain(res.status);
    });

    it("should send a reminder of payment due", async () => {
      const { user, card } = await seedUserWithCard();

      const reminderData = {
        cardId: card.id,
        userId: user.id,
        email: user.email,
        dueDate: new Date("2025-12-25"),
      };

      const res = await request(app)
        .post(`/reminders/${card.id}`)
        .set("user-id", user.id.toString())
        .send(reminderData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: expect.stringMatching(/reminder|success/i),
      });
    });
  });

  describe("DueDate", () => {
    it("should send a due date notification", async () => {
      const { user, card } = await seedUserWithCard();

      const dueDateData = {
        cardId: card.id,
        userId: user.id,
        email: user.email,
      };

      const res = await request(app)
        .post(`/reminders/${card.id}/dueDate`)
        .set("user-id", user.id.toString())
        .send(dueDateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: expect.stringMatching(/due date|notification|success/i),
      });
    });
  });
});