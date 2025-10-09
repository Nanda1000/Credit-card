import request from "supertest";
import { prisma } from "../../database/prisma.js";
import app from "../../app.js"; // Ensure this exports your Express app
import { seedUserWithCard } from "../utils/testUtils.js";

describe("User API Integration", () => {
  beforeAll(async () => await prisma.$connect());
  beforeEach(async () => {
    await prisma.reminder.deleteMany();
    await prisma.card.deleteMany();
    await prisma.user.deleteMany();
  });
  afterAll(async () => await prisma.$disconnect());

  it("GET /users/:id should return user details", async () => {
    const { user } = await seedUserWithCard();

    const res = await request(app)
      .get(`/users/${user.id}`)
      .set("user-id", user.id.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id: user.id,
      email: user.email,
    });
  });

  it("PATCH /users/me should update user details", async () => {
    const { user } = await seedUserWithCard();
    const updated = { email: "updated@test.com" };

    const res = await request(app)
      .patch("/users/me")
      .set("user-id", user.id.toString())
      .send(updated);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(updated.email);
  });

  it("DELETE /users/:id should delete user", async () => {
    const { user } = await seedUserWithCard();

    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set("user-id", user.id.toString());

    expect(res.statusCode).toBe(204);
  });
});
