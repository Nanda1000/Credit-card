import { prisma } from "../../database/prisma.js";
import { oauthService } from "../services/oauth.service.js";

jest.mock("../../database/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("OAuth Service Tests", () => {

  describe("Exchange code", () => {
    it("should throw error if no code passed", async () => {
      await expect(oauthService.exchangeCodeForToken(null))
        .rejects.toThrow("Code is required");
    });

    it("should exchange code", async () => {
      const mockUser = { id: 1, accessToken: "456897", refreshToken: "xyz" };
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await oauthService.exchangeCodeForToken("valid_code");
      expect(prisma.user.update).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe("Refresh access token", () => {
    it("should throw error if no token passed", async () => {
      await expect(oauthService.refreshAccessToken(null))
        .rejects.toThrow("Token is required");
    });

    it("should refresh token successfully", async () => {
      const mockUser = { id: 1, refreshToken: "4567", accessToken: "new123" };
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await oauthService.refreshAccessToken("4567");
      expect(prisma.user.update).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe("Save tokens", () => {
    it("should throw error if no token or userId", async () => {
      await expect(oauthService.saveUserTokens(null, null))
        .rejects.toThrow("Token and user ID are required");
    });

    it("should save tokens", async () => {
      const mockUser = {
        id: 1,
        accessToken: "123",
        refreshToken: "4567",
        tokenexpiry: new Date(),
      };
      prisma.user.update.mockResolvedValue(mockUser);

      const tokens = { accessToken: "123", refreshToken: "4567" };
      const result = await oauthService.saveUserTokens(1, tokens);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          accessToken: "123",
          refreshToken: "4567",
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("Get user tokens", () => {
    it("should throw error if no userId", async () => {
      await expect(oauthService.getUserTokens(null))
        .rejects.toThrow("User ID is required");
    });

    it("should return user tokens", async () => {
      const mockUser = { id: 1, accessToken: "abc", refreshToken: "xyz" };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await oauthService.getUserTokens(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
