import { Router } from "express";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { RegisterUserUseCase } from "../../application/useCases/RegisterUser";
import { LoginUserUseCase } from "../../application/useCases/LoginUser";
import { AuthController } from "../controllers/authController";

export function createAuthRouter(userRepo: UserRepository): Router {
  const router = Router();
  const registerUseCase = new RegisterUserUseCase(userRepo);
  const loginUseCase = new LoginUserUseCase(userRepo);
  const controller = new AuthController(registerUseCase, loginUseCase);
  router.post("/register", controller.register);
  router.post("/login", controller.login);
  return router;
}

