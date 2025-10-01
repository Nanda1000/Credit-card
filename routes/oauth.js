import express from "express";
import {redirectToTrueLayer, refreshToken, handleOAuthCallback} from "../controllers/oauth.controller.js";

const authRouter = express.Router();

authRouter.get("/truelayer", redirectToTrueLayer);
authRouter.get("/truelayer/callback", handleOAuthCallback);
authRouter.get("/truelayer/refreshtoken", refreshToken);

export default authRouter;