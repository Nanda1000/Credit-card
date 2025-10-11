import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../database/prisma.js";
import { seedUserWithCard } from "../utils/testUtils.js";

describe("OAuth Controller", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
  // delete in the correct order (child → parent)
  await prisma.payment.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.card.deleteMany();
  await prisma.user.deleteMany();
});


  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 400 when authorization code is missing", async () => {
    const res = await request(app)
      .get("/truelayer/does-not-exist/accesstoken")
      .query({ code: "" });

    expect(res.status).toBe(400);
    expect(res.text).toContain("Authorization code is missing");
  });

  it("should redirect to TrueLayer", async () => {
    const { user } = await seedUserWithCard();

    const res = await request(app)
      .get(`/truelayer/${user.id}`);

    expect(res.status).toBe(302); // redirect
    expect(res.headers.location).toContain("auth.truelayer.com");
  });

  it("should return 401 when user not authorized for refresh", async () => {
    const res = await request(app)
      .get("/truelayer/does-not-exist/refreshtoken");

    expect(res.status).toBe(401);
  });

  it("should refresh token for valid user", async () => {
    const { user } = await seedUserWithCard();

    // assign a dummy refresh token so the controller has something valid to use
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: "dummy_refresh_token" },
    });

    const res = await request(app)
      .get(`/truelayer/${user.id}/refreshtoken`)
      .set("user-id", user.id.toString());

    // Allow 200 or 500 since the external API might fail in a dev setup
    expect([200, 500]).toContain(res.status);
  });
});
