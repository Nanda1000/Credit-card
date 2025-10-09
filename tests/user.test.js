import { getUserById, updateUser, deleteUser } from "../services/user.service.js";
import { prisma } from "../database/prisma.js";

jest.mock("../database/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("User Service", () => {
  describe("getUserById", () => {
    it("should return user details", async () => {
      const mockUser = { id: "123", email: "test@demo.com" };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserById("123");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "123" } });
      expect(result).toEqual(mockUser);
    });

    it("should throw error if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(getUserById("999")).rejects.toThrow("User not found");
    });
  });

  describe("updateUser", () => {
    it("should update user details", async () => {
      const mockUser = { id: "123", email: "old@test.com" };
      const updated = { email: "new@test.com" };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, ...updated });

      const result = await updateUser("123", updated);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "123" },
        data: updated,
      });
      expect(result).toEqual({ id: "123", email: "new@test.com" });
    });
  });

  describe("deleteUser", () => {
    it("should delete user and return deleted record", async () => {
      const mockUser = { id: "123", email: "demo@del.com" };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.delete.mockResolvedValue(mockUser);

      const result = await deleteUser("123");
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "123" } });
      expect(result).toEqual(mockUser);
    });
  });
});
