import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

import { connectMongo } from "./infrastructure/database/mongoClient";
import { authRouter, userRouter, workoutRouter, analyticsRouter } from "./composition";
import { errorHandler } from "./interfaces/middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/workouts", workoutRouter);
app.use("/analytics", analyticsRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "test") {
  if (!process.env.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.error("Fatal: JWT_SECRET is not set. Add JWT_SECRET to backend/.env and restart.");
    process.exit(1);
  }
  connectMongo()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`WODLab backend listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to start server", err);
      process.exit(1);
    });
}

export { app };
