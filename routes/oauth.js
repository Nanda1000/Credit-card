import express from "express";
import {redirectToTrueLayer, refreshToken, handleOAuthCallback} from "../controllers/oauth.controller.js";

const authRouter = express.Router();

authRouter.get("/truelayer/:userId", redirectToTrueLayer);
authRouter.get("/truelayer/:userId/accesstoken", handleOAuthCallback);
authRouter.get("/truelayer/:userId/refreshtoken", refreshToken);

export default authRouter;