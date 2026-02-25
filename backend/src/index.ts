import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import movementRoutes from "./routes/movements.js";
import workoutRoutes from "./routes/workouts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/workouts", workoutRoutes);

// ─── Serve Frontend (SPA Fallback) ────────────────────────────────────────
const frontendPath = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

// Catch-all route for any GET request that doesn't match an API route
app.get("*", (req, res, next) => {
    // If it's an API route that reached here, let it be handled by 404/Error Handler
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
        return next();
    }
    res.sendFile(path.join(frontendPath, "index.html"));
});

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
