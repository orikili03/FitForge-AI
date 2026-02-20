import { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "../../application/useCases/RegisterUser";
import { LoginUserUseCase } from "../../application/useCases/LoginUser";
import { registerSchema, loginSchema } from "../validators/authValidators";

export class AuthController {
  constructor(
    private registerUser: RegisterUserUseCase,
    private loginUser: LoginUserUseCase
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerSchema.parse(req.body);
      const result = await this.registerUser.execute(parsed);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginSchema.parse(req.body);
      const result = await this.loginUser.execute(parsed);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

