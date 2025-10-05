import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/user.js";
import cardRouter from "./routes/card.js";
import paymentRouter from "./routes/payment.js";
import reminderRouter from "./routes/reminder.js"
import { errorHandler } from "./middleware/error.middleware.js";
import authRouter from "./routes/oauth.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json())
app.use("/api", authRouter);
app.use("/api", router);
app.use("/api", cardRouter);
app.use("/api", paymentRouter);
app.use("/api", reminderRouter);
app.use(errorHandler);

app.get("/", (req, res) => res.send("Backend Running"));

// Do not automatically start the server when running tests — tests import the app.
if (process.env.NODE_ENV !== 'test') {
	app.listen(5000, () => console.log("Server running"));
}

export default app;