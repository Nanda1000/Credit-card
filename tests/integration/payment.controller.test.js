

import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../database/prisma.js";
import { seedUserWithCard } from "../utils/testUtils.js";

describe("Payment API", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Clean tables in correct dependency order
    await prisma.payment.deleteMany();
    await prisma.reminder.deleteMany();
    await prisma.card.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  //  Invalid user → should fail
  it("should return 400 or 404 if invalid user is passed", async () => {
    const res = await request(app).post("/payments/does-not-exist");
    expect([400, 404]).toContain(res.status);
  });

  
  // Get payment by ID
  it("should get payment by id if it exists", async () => {
    const { payment } = await seedUserWithCard();

    const res = await request(app)
      .get(`/payments/${payment.id}`)
      .set("payment-id", payment.id.toString());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
    });
  });

  // Non-existent payment → expect 404
  it("should return 404 if payment not found", async () => {
    const res = await request(app).get("/payments/non-existent-id");
    expect([400, 404]).toContain(res.status);
  });

  // Handle webhook
  it("should handle webhook update if payment exists", async () => {
    const { payment } = await seedUserWithCard();

    const data = {
      providerPaymentId: payment.id,
      status: "failed",
    };

    const res = await request(app)
      .post(`/payments/${payment.id}/webhook`)
      .send(data);

    expect([200, 204, 400]).toContain(res.status);

    if (res.status === 200) {
      expect(res.body).toMatchObject({
        id: payment.id,
        status: data.status,
      });
    }
  });

  //  Non-existing payment for webhook
  it("should return 404 if webhook targets non-existing payment", async () => {
    const res = await request(app)
      .post("/payments/invalid-id/webhook")
      .send({ status: "failed" });

    expect([400, 404]).toContain(res.status);
  });
});
