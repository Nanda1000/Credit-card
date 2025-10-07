import request from "supertest";
import app from "../../app.js";
import {prisma} from "../../database/prisma.js";
import { seedUserWithCard } from "../utils/testUtils.js";


describe("Payment API", ()=>{
    beforeAll(async ()=>{
        await prisma.$connect();
    });

    beforeEach(async ()=>{
        await prisma.user.deleteMany();
        await prisma.reminder.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.card.deleteMany();
    });

    afterAll(async ()=>{
        await prisma.$disconnect();
    });

    it("should return no payment if it connects", async ()=>{
        const res = await request(app).post("/payments/does-not-exist");
        expect(res.status).toBe(400);
    });

    it("should create a payment if the user exists", async ()=>{
        const {user, card} = await seedUserWithCard();
        const paymentData = {
            cardId: card.id,
            amount: 1000,
            currency: "GBP",
            method: "pisp",
            idempotencyKey: "unique-key-123"
        };

        const res = await request(app)
            .post(`/payments/${user.id}`)
            .set("user-id", user.id.toString())
            .send(paymentData);

        expect(res.status).toBe(201);
        expect(res.body).toEqual(
            expect.objectContaining({
                method: paymentData.method,
                amount: paymentData.amount,
            })
        )
    });

    it("should get payment id if it exists", async ()=>{
        const {user, card, payment} = await seedUserWithCard();

        const res = await request(app)
        .get(`/payments/${payment.id}`)
        .set("payment-id", payment.id.toString())

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            id: payment.id,
            method: payment.method,
            amount: payment.amount,
        })
    });

    it("should return no payment asscoiated with the user", async ()=>{
        const res = await request(app).get(`/payments/${payment.id}`);
        expect(res.status).toBe(404);
    })

    it("should handle webhook if payment exists", async ()=>{
        const data = {
            providerPaymentId: "123",
            status: "failed"
        }

        const res = await request(app)
        .get(`/payments/${payment.id}/webhook`)
        .set("payments-id", payment.id.toString())
        .send(data)

        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({
            id: payment.id,
            providerPaymentId: data.providerPaymentId,
            status: data.status,
        });
    });

    it("should not handle webhook if payment do not exists", async ()=>{
        const res = await request(app).get(`/payments/${payment.id}/webhook`);
        expect(res.status).toBe(400);
    })

})