import { oauthService } from "../services/oauth.service.js";

export async function redirectToTrueLayer(req, res) {
    const authUrl = oauthService.getAuthorizationUrl();
    res.redirect(authUrl);
}

export async function handleOAuthCallback(req, res, next) {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).send("Authorization code is missing");
        const userId = req.user?.id;
        if (!userId) return res.status(400).send("User ID is missing");
        const tokens = await oauthService.exchangeCodeForToken(code);
        if (userId) await oauthService.saveUserTokens(userId, tokens);
        res.status(200).json({
        message: "OAuth successful, tokens saved.",
        userId: parseInt(userId),
        });

    } catch (err) {
        next(err);
    }
}

export async function refreshToken(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).send("Unauthorized");
        const { refresh_token } = await oauthService.getUserTokens(userId);
        const newTokens = await oauthService.refreshAccessToken(refresh_token);
        await oauthService.saveUserTokens(userId, newTokens);
        res.status(200).send("Access token refreshed successfully.");
    } catch (err) {
        next(err);
    }
}