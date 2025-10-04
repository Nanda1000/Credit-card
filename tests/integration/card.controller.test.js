// tests/controllers/card.controller.test.js
import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../database/prisma.js";
import { seedUserWithCard } from "../utils/testUtils.js";

describe("Card API", () => {
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

  it("should return 404 if card not found", async () => {
    const res = await request(app).get("/cards/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("should return created card if it exists", async () =>{
    const {user, card} = await seedUserWithCard();
    const createcard = {
        bankName: "Monzo Bank",
        cardType: "Visa",
        cardNetwork: "seed",
        accountId: "123",
        providerId: "123",
        cardNumber: "5678",
        displayName: "Lloyds",
        nameOnCard: "NK",
        validFrom: "12/25",
        validTo: "01/30",
    }

    const res = await request(app)
    .post(`/users/${user.id}/cards`)
    .set("user-id", user.id.toString())
    .send(createcard);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(createcard);
  })

  it("should return a card if it exists", async () => {
    const { user, card } = await seedUserWithCard();

    const res = await request(app)
      .get(`/cards/${card.id}`)
      .set("user-id", user.id.toString());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: card.id,
      displayName: card.displayName,
      bankName: card.bankName,
    });
  });

  it("should delete a card if it exists", async () => {
    const { user, card } = await seedUserWithCard();

    const res = await request(app)
      .delete(`/cards/${card.id}`)
      .set("user-id", user.id.toString());

    expect(res.status).toBe(200);
    expect(res.body.message || res.body).toMatch(/deleted/i);

    const check = await prisma.card.findUnique({ where: { id: card.id } });
    expect(check).toBeNull(); // confirm deletion from DB
  });

  it("should update a card if it exists", async () => {
    const { user, card } = await seedUserWithCard();

    const updatedData = {
      creditLimit: 4700,
      balance: 3569,
    };

    const res = await request(app)
      .patch(`/cards/${card.id}`)
      .set("user-id", user.id.toString())
      .send(updatedData);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(updatedData);
  });

  it("should return utilization if the card exists", async ()=>{
    const { user, card } = await seedUserWithCard();

    const res = await request(app)
    .get(`/cards/${card.id}/utilization`)
    .set("user-id", user.id.toString());

    expect(res.status).toBe(200);
    expect(res.body.utilization).toBeDefined();

  });

  it("should return 404 if no cards associated with user", async()=>{
    const res = await request(app).get("/users/userId/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("should return all cards if it exists", async ()=>{
    const {user, card} = await seedUserWithCard();

    const res = await request(app)
    .get(`/users/${user.id}/cards`)
    .set("user-id", user.id.toString())

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({
    id: card.id,
    displayName: card.displayName,
    bankName: card.bankName,
    cardType: card.cardType,
    });
  });

  it("should return card balance", async ()=>{
    const {user, card} = await seedUserWithCard();

    const res = await request(app)
    .get(`/users/${user.id}/cards/balance`)
    .set("user-id", user.id.toString());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

  })
});
