import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import gamesRouter from "./routes/games.js";
import authRouter from "./routes/auth.js";
import cartRouter from "./routes/cart.js";
import paymentsRouter from "./routes/payments.js";

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

const app = express();

const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman)
    if (!origin) return callback(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// routes
app.use("/api/games", gamesRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payments", paymentsRouter);

// health check
app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});