import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { WorkoutRepository } from "../../domain/repositories/WorkoutRepository";
import { GetProgressUseCase } from "../../application/useCases/GetProgressUseCase";
import { AnalyticsController } from "../controllers/analyticsController";

export function createAnalyticsRouter(workoutRepo: WorkoutRepository): Router {
  const router = Router();
  const getProgressUseCase = new GetProgressUseCase(workoutRepo);
  const controller = new AnalyticsController(getProgressUseCase);
  router.get("/progress", authMiddleware, controller.progress);
  return router;
}

