import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import {
  GetCurrentUserUseCase,
  UpdateUserProfileUseCase,
} from "../../application/useCases/GetAndUpdateUser";
import { UserController } from "../controllers/userController";

const router = Router();

const userRepo = new PrismaUserRepository();
const getCurrent = new GetCurrentUserUseCase(userRepo);
const updateProfile = new UpdateUserProfileUseCase(userRepo);
const controller = new UserController(getCurrent, updateProfile);

router.get("/me", authMiddleware, controller.me);
router.put("/me", authMiddleware, controller.updateMe);
router.put("/me/equipment", authMiddleware, controller.updateEquipment);

export { router as userRouter };

