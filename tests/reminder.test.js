

jest.mock("../database/prisma.js", () => ({
  prisma: {
    card: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    reminder: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../services/utils/email.service.js", () => ({
  sendOverdueEmail: jest.fn(),
  sendDueEmail: jest.fn(),
}));

import { prisma } from "../database/prisma.js";
import { reminder } from "../services/reminder.service.js";
import * as emailservice from "../services/utils/email.service.js";

describe("Reminder Service", () => {
  describe("paymentDueDate", () => {
    it("should return existing due date from DB", async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: "123",
        userId: "456",
        paymentDueDate: "2025-07-06",
      });

      const result = await reminder.paymentDueDate("123", "456");

      expect(prisma.card.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
      });
      expect(result).toBe("2025-07-06");
    });

    it("should throw if card not found", async () => {
      prisma.card.findUnique.mockResolvedValue(null);
      await expect(reminder.paymentDueDate("123", "456")).rejects.toThrow("Card not found");
    });

    it("should throw if user unauthorized", async () => {
      prisma.card.findUnique.mockResolvedValue({
        id: "123",
        userId: "999",
        paymentDueDate: "2025-07-06",
      });
      await expect(reminder.paymentDueDate("123", "456")).rejects.toThrow("Unauthorized access to this card");
    });
  });

  describe("scheduleAllReminders", () => {
    it("should schedule reminders for each card", async () => {
      const mockCards = [
        {
          id: "c1",
          userId: 1,
          paymentDueDate: "2025-07-10T00:00:00Z",
          user: { email: "a@example.com" },
        },
      ];

      prisma.card.findMany.mockResolvedValue(mockCards);
      prisma.reminder.findFirst.mockResolvedValue(null);
      prisma.reminder.create.mockResolvedValue({ id: "r1" });

      await reminder.scheduleAllReminders();

      expect(prisma.card.findMany).toHaveBeenCalledWith({where: { paymentDueDate: { not: null } },include: { user: true },});
      expect(prisma.reminder.create).toHaveBeenCalled();
      expect(emailservice.sendDueEmail).toHaveBeenCalledTimes(1);
      expect(emailservice.sendDueEmail).toHaveBeenCalledWith("a@example.com", expect.anything());
    });
  });

  describe("checkAndSendReminders", () => {
    it("should send reminder emails and mark as sent", async () => {
      const mockReminders = [
        {
          id: "r1",
          user: { email: "test@example.com" },
          cardId: "c1",
          dueDate: new Date("2025-07-06"),
        },
      ];

      prisma.reminder.findMany.mockResolvedValue(mockReminders);
      prisma.reminder.update.mockResolvedValue({ id: "r1", sent: true });

      await reminder.checkAndSendReminders();

      expect(prisma.reminder.findMany).toHaveBeenCalled();
      expect(prisma.reminder.update).toHaveBeenCalledWith({
        where: { id: "r1" },
        data: { sent: true },
      });
    });
  });
});
