import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { PrismaWorkoutRepository } from "../../infrastructure/repositories/PrismaWorkoutRepository";
import { WorkoutEngine } from "../../domain/services/WorkoutEngine";
import {
  SimpleAssessmentAgent,
  SimpleConstraintAgent,
  SimpleProgressionAgent,
  SimpleProgrammingAgent,
} from "../../domain/services/impl/SimpleAgents";
import {
  CompleteWorkoutUseCase,
  GenerateWorkoutUseCase,
  ListWorkoutHistoryUseCase,
} from "../../application/useCases/WorkoutUseCases";
import { WorkoutController } from "../controllers/workoutController";

const router = Router();

const userRepo = new PrismaUserRepository();
const workoutRepo = new PrismaWorkoutRepository();
const engine = new WorkoutEngine(
  new SimpleAssessmentAgent(),
  new SimpleConstraintAgent(),
  new SimpleProgressionAgent(),
  new SimpleProgrammingAgent()
);

const generateUseCase = new GenerateWorkoutUseCase(userRepo, workoutRepo, engine);
const listHistoryUseCase = new ListWorkoutHistoryUseCase(workoutRepo);
const completeUseCase = new CompleteWorkoutUseCase(workoutRepo);
const controller = new WorkoutController(generateUseCase, listHistoryUseCase, completeUseCase);

router.post("/generate", authMiddleware, controller.generate);
router.get("/history", authMiddleware, controller.history);
router.post("/complete", authMiddleware, controller.complete);

export { router as workoutRouter };

