import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/user.js";
import cardRouter from "./routes/card.js";
import paymentRouter from "./routes/payment.js";
import reminderRouter from "./routes/reminder.js"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json())
app.use("/api", router);
app.use("/api", cardRouter);
app.use("/api", paymentRouter);
app.use("/api", reminderRouter);

app.get("/", (req, res) => res.send("Backend Running"));
app.use("")
app.listen(5000, ()=> console.log("Server running"))