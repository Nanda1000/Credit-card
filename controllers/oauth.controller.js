import { oauthService } from "../services/oauth.service"

export const oauthControler = {
    async redirectToTrueLayer(req, res) {
        const authUrl = oauthService.getAuthorizationUrl();
        res.redirect(authUrl);
    },

    async handleOAuthCallback(req, res, next) {
        try {
            const { code } = req.query;
            if (!code) {
                return res.status(400).send("Authorization code is missing");
            }
            const tokens = await oauthService.exchangeCodeForToken(code);
            const userId = req.user.id;
            await oauthService.saveUserTokens(userId, tokens);
            res.send("OAuth successful, tokens saved.");
        } catch (err) {
            next(err);
        }
    },

    async refreshToken(req, res, next) {
        try {
            const userId = req.user.id;
            const { refresh_token } = await oauthService.getUserTokens(userId);
            const newTokens = await oauthService.refreshAccessToken(refresh_token);
            await oauthService.saveUserTokens(userId, newTokens);
            res.send("Access token refreshed successfully.");
        } catch (err) {
            next(err);
        }
    },
};