import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { WorkoutCompletionModel, WorkoutModel } from "../../infrastructure/database/models";

export class AnalyticsController {
  // Simple initial implementation; could be moved to a dedicated use case later.
  progress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const workouts = await WorkoutModel.find({ userId }).select("_id").exec();
      const workoutIds = workouts.map((w) => w._id.toString());

      const completions = await WorkoutCompletionModel.find({
        workoutId: { $in: workoutIds },
      })
        .sort({ completedAt: 1 })
        .exec();

      const points = completions.map((c) => ({
        date: c.completedAt.toISOString(),
        rpe: c.rpe,
        roundsOrReps: c.roundsOrReps ?? null,
      }));

      res.json({
        success: true,
        data: {
          totalSessions: completions.length,
          averageRpe:
            completions.length > 0
              ? completions.reduce((sum, c) => sum + c.rpe, 0) / completions.length
              : 0,
          points,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

