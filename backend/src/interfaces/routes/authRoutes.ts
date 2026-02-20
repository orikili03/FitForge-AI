import { Router } from "express";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { RegisterUserUseCase } from "../../application/useCases/RegisterUser";
import { LoginUserUseCase } from "../../application/useCases/LoginUser";
import { AuthController } from "../controllers/authController";

const router = Router();

const userRepo = new PrismaUserRepository();
const registerUseCase = new RegisterUserUseCase(userRepo);
const loginUseCase = new LoginUserUseCase(userRepo);
const controller = new AuthController(registerUseCase, loginUseCase);

router.post("/register", controller.register);
router.post("/login", controller.login);

export { router as authRouter };

