import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import movementRoutes from "./routes/movements.js";
import workoutRoutes from "./routes/workouts.js";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/movements", movementRoutes);
app.use("/workouts", workoutRoutes);

// ─── Error Handler ────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────
async function start() {
    await connectDB();
    app.listen(env.PORT, () => {
        console.log(`🚀 WODLab V2 backend running on port ${env.PORT}`);
    });
}

start();
