import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  GetCurrentUserUseCase,
  UpdateUserProfileUseCase,
} from "../../application/useCases/GetAndUpdateUser";
import { updateUserSchema } from "../validators/userValidators";
import { updateEquipmentSchema } from "../validators/equipmentValidators";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";

export class UserController {
  constructor(
    private getCurrentUser: GetCurrentUserUseCase,
    private updateUserProfile: UpdateUserProfileUseCase
  ) {}

  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const profile = await this.getCurrentUser.execute(userId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = updateUserSchema.parse(req.body);
      const userId = req.user!.userId;
      const profile = await this.updateUserProfile.execute(userId, parsed);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  updateEquipment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = updateEquipmentSchema.parse(req.body);
      const userId = req.user!.userId;

      // Keep this controller thin: delegate persistence to repository
      const userRepo = new PrismaUserRepository();
      const user = await userRepo.updateEquipment(userId, parsed);

      res.json({
        success: true,
        data: {
          equipment: user.equipment,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

