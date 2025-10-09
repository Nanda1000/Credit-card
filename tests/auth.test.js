import axios from "axios";
import { oauthService } from "../services/oauth.service.js";
import { prisma } from "../database/prisma.js";

jest.mock("axios");
jest.mock("../database/prisma.js", () => ({
  prisma: {
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe("OAuth Service Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------
  // Exchange Code for Token
  // ------------------------
  describe("exchangeCodeForToken", () => {
    it("should throw error if no code is provided", async () => {
      await expect(oauthService.exchangeCodeForToken(null))
        .rejects.toThrow("Failed to exchange code for token");
    });

    it("should exchange code successfully", async () => {
      const mockData = { accessToken: "abc123", refreshToken: "xyz789" };
      axios.post.mockResolvedValueOnce({ data: mockData });

      const result = await oauthService.exchangeCodeForToken("valid_code");

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it("should throw error if axios fails", async () => {
      axios.post.mockRejectedValueOnce(new Error("Network Error"));
      await expect(oauthService.exchangeCodeForToken("bad_code"))
        .rejects.toThrow("Failed to exchange code for token");
    });
  });

  // ------------------------
  // Refresh Access Token
  // ------------------------
  describe("refreshAccessToken", () => {
    it("should throw error if no refresh token is provided", async () => {
      await expect(oauthService.refreshAccessToken(null))
        .rejects.toThrow("Failed to refresh access token");
    });

    it("should refresh access token successfully", async () => {
      const mockData = { accessToken: "newToken123", refreshToken: "newRefresh456" };
      axios.post.mockResolvedValueOnce({ data: mockData });

      const result = await oauthService.refreshAccessToken("valid_refresh_token");

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it("should throw error if axios fails", async () => {
      axios.post.mockRejectedValueOnce(new Error("Network Error"));
      await expect(oauthService.refreshAccessToken("invalid_refresh_token"))
        .rejects.toThrow("Failed to refresh access token");
    });
  });

  // ------------------------
  // Save User Tokens
  // ------------------------
  describe("saveUserTokens", () => {
    it("should throw error if userId is missing", async () => {
      await expect(oauthService.saveUserTokens(null, { accessToken: "a", refreshToken: "b" }))
        .rejects.toThrow("User ID is required");
    });


    it("should save tokens successfully", async () => {
      const mockUser = { id: "123", accessToken: "a", refreshToken: "b" };
      prisma.user.update.mockResolvedValueOnce(mockUser);

      const result = await oauthService.saveUserTokens("123", {
        accessToken: "a",
        refreshToken: "b",
        tokenexpiry: new Date(),
      });

      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  // ------------------------
  // Get User Tokens
  // ------------------------
  describe("getUserTokens", () => {
    it("should throw error if userId is missing", async () => {
      await expect(oauthService.getUserTokens(null))
        .rejects.toThrow("User ID is required");
    });

    it("should return user tokens successfully", async () => {
      const mockUser = { id: "123", accessToken: "a", refreshToken: "b" };
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await oauthService.getUserTokens("123");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "123" }, select: { refresh_token: true } });
      expect(result).toEqual(mockUser);
    });
  });
});
