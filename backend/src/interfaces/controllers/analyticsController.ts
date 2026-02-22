import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { GetProgressUseCase } from "../../application/useCases/GetProgressUseCase";

export class AnalyticsController {
  constructor(private getProgress: GetProgressUseCase) {}

  progress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await this.getProgress.execute(userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

