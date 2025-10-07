import { pispService } from "../services/pisp.service.js";
import {prisma} from "../database/prisma.js";
import { paymentService } from "../services/payment.service.js";



jest.mock("../database/prisma.js", () =>({
    prisma: {
        card:{
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
        }
    }
}));

jest.mock("../services/pisp.service.js", ()=>({
    pispService: {
        createPayment: jest.fn(),
    },
}));

describe("Payment service", ()=>{
    beforeEach(()=>{
        jest.clearAllMocks();
    });

    describe("initiate Pisp", ()=>{
        it("should throw error if it does not exists", async ()=>{
            await expect(paymentService.initiatePISP(null))
            .rejects.toThrow("Payment ID is required");
        });
        it("should return PISP if it exists", async ()=>{
            const mockCard = {id: "1", userId: "123", paymentId: "456", providerPaymentId: "567", redirectUrl: "https//time.com"};
            prisma.payment.update.mockResolvedValue(mockCard);
            const result = await paymentService.initiatePISP("456");
            expect(prisma.payment.update).toHaveBeenCalledWith({ where: { paymentId: "456" }, data: {providerPaymentId:"567", redirectUrl:"https//time.com" }});
            expect(result).toEqual(mockCard);
        });
    });

    describe("Get Payment Status", ()=>{
        it("should throw error if it does not exists", async ()=>{
            await expect(paymentService.getPaymentStatus(null))
            .rejects.toThrow("Payment ID is required");
        });

        it("should get payment if it exists", async ()=>{
            const mockCard = {id: "1", paymentId: "456", userId: "123", providerPaymentId: "567", redirectUrl: "https//time.com"};
            prisma.payment.findUnique.mockResolvedValue(mockCard);
            const result = await paymentService.getPaymentStatus("456");
            expect(prisma.payment.findUnique).toHaveBeenCalledWith({where: {paymentId: "456"}});
            expect(result).toEqual(mockCard);
        });
    });

    describe("Handle Webhook", ()=>{
        it("should throw error if it does not exists", async ()=>{
            await expect(paymentService.handleProviderWebhook(null))
            .rejects.toThrow("Payment ID is required");
        });

        it("should handle webhook if it exists", async ()=>{
            const mockCard = {id: "1", paymentId: "456", userId: "123", providerPaymentId: "567", status: "Pending"};
            prisma.payment.update.mockResolvedValue(mockCard);
            const result = await paymentService.handleProviderWebhook("456");
            expect(prisma.payment.update).toHaveBeenCalledWith({where: {paymentId: "456"}, data: {status: "Pending"}});
            expect(result).toEqual(mockCard);
        })
    })
})

