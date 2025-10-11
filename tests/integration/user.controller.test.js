import request from "supertest";
import { prisma } from "../../database/prisma.js";
import app from "../../app.js";
import { seedUserWithCard } from "../utils/testUtils.js";

// Mock the auth middleware to bypass Firebase authentication
jest.mock("../../middleware/auth.middleware.js", () => ({
  verifyToken: (req, res, next) => {
    // Simulate authenticated user from header
    const userId = req.headers["user-id"];
    if (userId) {
      req.user = { id: parseInt(userId) };
      next();
    } else {
      res.status(401).json({ error: "No token provided" });
    }
  }
}));

describe("User API Integration", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
 
  beforeEach(async () => {
    // Delete in correct order to respect foreign key constraints
    await prisma.payment.deleteMany();
    await prisma.reminder.deleteMany();
    await prisma.card.deleteMany();
    await prisma.user.deleteMany();
  });
 
  afterAll(async () => {
    await prisma.$disconnect();
  });

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
    const { user, card } = await seedUserWithCard();

    // Delete related records first due to foreign key constraints
    await prisma.payment.deleteMany({ where: { userId: user.id } });
    await prisma.reminder.deleteMany({ where: { userId: user.id } });
    await prisma.card.deleteMany({ where: { userId: user.id } });

    const res = await request(app)
      .delete("/users/me")
      .set("user-id", user.id.toString());

    expect(res.statusCode).toBe(204);
   
    // Verify user is deleted
    const deletedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    expect(deletedUser).toBeNull();
  });
});