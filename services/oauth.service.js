import axios from "axios";
import { prisma } from "../database/prisma.js";


const TL_AUTH_URL = "https://auth.truelayer.com";
const CLIENT_ID = process.env.TRUELAYER_CLIENT_ID;
const CLIENT_SECRET = process.env.TRUELAYER_CLIENT_SECRET;
const REDIRECT_URI = process.env.TRUELAYER_REDIRECT_URI;

export const oauthService = {

    // Constructing the url
    getAuthorizationUrl() {
        const scopes = "cards balance transactions";
        return `${TL_AUTH_URL}/connect/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&providers=uk-ob-all&scope=${encodeURIComponent(scopes)}`;
    },

    // Exchanges code for access token
    async exchangeCodeForToken(code) {
        try {
            const response = await axios.post(`${TL_AUTH_URL}/connect/token`, {
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            });
            return response.data;
        } catch (error) {
            console.error("Error exchanging code for token:", error);
            throw new Error("Failed to exchange code for token");
        }
    },

    // Refreshes access token
    async refreshAccessToken(refreshToken) {
        try{
            const response = await axios.post(`${TL_AUTH_URL}/connect/token`, {
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            });
            return response.data;
        } catch (error) {
            console.error("Error refreshing access token:", error);
            throw new Error("Failed to refresh access token");
        }
    },

    //Saves tokens into DB for  later use
    async saveUserTokens(userId, tokens) {
        if (!userId) throw new Error("User ID is required");
        const { access_token, refresh_token, expires_in } = tokens;
        return prisma.user.update({
            where: { id: userId },
            data: {
                access_token,
                refresh_token,
                expires_in,
            }
        });
    },

    async getUserTokens(userId) {
        if (!userId) throw new Error("User ID is required");
        return prisma.user.findUnique({
            where: { id: userId },
            select: { refresh_token: true },
        });
    },

};