import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { rateLimitGenerate } from "../middleware/rateLimitGenerate";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { WorkoutRepository } from "../../domain/repositories/WorkoutRepository";
import { WorkoutEngine } from "../../domain/services/WorkoutEngine";
import {
  CompleteWorkoutUseCase,
  GenerateWorkoutUseCase,
  ListWorkoutHistoryUseCase,
} from "../../application/useCases/WorkoutUseCases";
import { WorkoutController } from "../controllers/workoutController";

export interface WorkoutRouterDeps {
  userRepo: UserRepository;
  workoutRepo: WorkoutRepository;
  engine: WorkoutEngine;
}

export function createWorkoutRouter(deps: WorkoutRouterDeps): Router {
  const { userRepo, workoutRepo, engine } = deps;
  const router = Router();
  const generateUseCase = new GenerateWorkoutUseCase(userRepo, workoutRepo, engine);
  const listHistoryUseCase = new ListWorkoutHistoryUseCase(workoutRepo);
  const completeUseCase = new CompleteWorkoutUseCase(workoutRepo);
  const controller = new WorkoutController(generateUseCase, listHistoryUseCase, completeUseCase);
  router.post("/generate", rateLimitGenerate, authMiddleware, controller.generate);
  router.get("/history", authMiddleware, controller.history);
  router.post("/complete", authMiddleware, controller.complete);
  return router;
}

