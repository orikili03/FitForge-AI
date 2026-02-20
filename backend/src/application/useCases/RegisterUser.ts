import { UserRepository } from "../../domain/repositories/UserRepository";
import { RegisterRequestDTO, AuthResponseDTO } from "../dto/AuthDTO";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class RegisterUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(input: RegisterRequestDTO): Promise<AuthResponseDTO> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      const error: any = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await this.userRepo.create({
      email: input.email,
      passwordHash,
      fitnessLevel: input.fitnessLevel,
      goals: [],
      equipmentAccess: [],
      movementConstraints: [],
      injuryFlags: [],
    });

    const token = this.signToken(user.id);
    return { token };
  }

  private signToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const err: any = new Error("Server configuration error. Please try again later.");
      err.statusCode = 503;
      throw err;
    }
    return jwt.sign({ userId }, secret, { expiresIn: "7d" });
  }
}

