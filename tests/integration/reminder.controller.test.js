import request from "supertest";
import app from "../../app.js";
import {prisma} from "../../database/prisma.js";
import { seedUserWithCard } from "../utils/testUtils.js";

describe("Reminder", ()=>{
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

    describe("Payment", ()=>{
        it("should throw an error if no card or due date is given", async ()=>{
            const res = await app.post("/reminders/does-not-exist");
            expect(res.status).toBe(201)
        });

        it("should send a reminder of payment due", async ()=>{
            const {user, card} = await seedUserWithCard();

            const res = await request(app)
            .post(`reminders/${card.id}`)
            .send(user.email)

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                userId: user.id,
                cardId: card.id,
                email: user.email
            });
        })
    });

    describe("DueDate", ()=>{
        it("should send a due date notification", async ()=>{
            const {user, card, reminder} = await seedUserWithCard();
            const res = request(app)
            .get(`reminders/${card.id}/dueDate`)

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                id: card.id,
                dueDate: reminder.dueDate,
                email: user.email,
            })
        });
    })
})