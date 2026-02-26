import express, { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { existsSync } from "fs";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import movementRoutes from "./routes/movements.js";
import workoutRoutes from "./routes/workouts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────
app.use(helmet()); // Set security-related HTTP headers
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ─── Health Check (root-level for load balancer compatibility) ────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes (all under /api/*) ────────────────────────────────────────
const apiRouter = Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/movements", movementRoutes);
apiRouter.use("/workouts", workoutRoutes);
app.use("/api", apiRouter);

// ─── Serve Frontend (SPA Fallback) ────────────────────────────────────────
const frontendPath = path.resolve(__dirname, "../../frontend/dist");
const hasFrontend = existsSync(frontendPath);

if (hasFrontend) {
    app.use(express.static(frontendPath));
} else {
    console.log("ℹ️ Frontend dist not found. Backend running in API-only mode.");
}

// Catch-all: serve index.html for any GET that isn't an API or health route
app.get("*path", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
        return next();
    }

    if (hasFrontend && existsSync(path.join(frontendPath, "index.html"))) {
        res.sendFile(path.join(frontendPath, "index.html"));
    } else {
        res.status(404).json({ error: "Not Found", message: "Frontend assets not available on this server." });
    }
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
