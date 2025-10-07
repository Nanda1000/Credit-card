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
// Test helper: allow tests to set req.user via `user-id` header
app.use((req, res, next) => {
	const headerUserId = req.headers['user-id'] || req.headers['user_id'];
	const headerPaymentId = req.headers['payment-id'] || req.headers['payment_id'];
	if (headerUserId || headerPaymentId) {
		// Attach a minimal user object expected by controllers
		req.user = { id: Number(headerUserId) };
		req.payment = {id: Number(headerPaymentId)};

	}
	next();
});

app.use(authRouter);
app.use(router);
app.use(cardRouter);
app.use(paymentRouter);
app.use(reminderRouter);
app.use(errorHandler);

app.get("/", (req, res) => res.send("Backend Running"));

// Do not automatically start the server when running tests — tests import the app.
if (process.env.NODE_ENV !== 'test') {
	app.listen(5000, () => console.log("Server running"));
}

export default app;