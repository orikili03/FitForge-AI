import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  CompleteWorkoutUseCase,
  GenerateWorkoutUseCase,
  ListWorkoutHistoryUseCase,
} from "../../application/useCases/WorkoutUseCases";
import {
  completeWorkoutSchema,
  generateWorkoutSchema,
} from "../validators/workoutValidators";

export class WorkoutController {
  constructor(
    private generateWorkout: GenerateWorkoutUseCase,
    private listHistory: ListWorkoutHistoryUseCase,
    private completeWorkout: CompleteWorkoutUseCase
  ) {}

  generate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const parsed = generateWorkoutSchema.parse(req.body);
      const workout = await this.generateWorkout.execute(userId, parsed);
      res.status(201).json({ success: true, data: workout });
    } catch (err) {
      next(err);
    }
  };

  history = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const items = await this.listHistory.execute(userId);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  };

  complete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const parsed = completeWorkoutSchema.parse(req.body);
      await this.completeWorkout.execute(userId, parsed);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

