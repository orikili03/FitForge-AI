import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { UserRepository } from "../../domain/repositories/UserRepository";
import {
  GetCurrentUserUseCase,
  UpdateUserProfileUseCase,
} from "../../application/useCases/GetAndUpdateUser";
import { UserController } from "../controllers/userController";

export function createUserRouter(userRepo: UserRepository): Router {
  const router = Router();
  const getCurrent = new GetCurrentUserUseCase(userRepo);
  const updateProfile = new UpdateUserProfileUseCase(userRepo);
  const controller = new UserController(getCurrent, updateProfile, userRepo);
  router.get("/me", authMiddleware, controller.me);
  router.put("/me", authMiddleware, controller.updateMe);
  router.put("/me/equipment", authMiddleware, controller.updateEquipment);
  return router;
}

