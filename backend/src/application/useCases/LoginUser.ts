import { UserRepository } from "../../domain/repositories/UserRepository";
import { AuthResponseDTO, LoginRequestDTO } from "../dto/AuthDTO";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class LoginUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(input: LoginRequestDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      const error: any = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    let match = false;
    try {
      match = await bcrypt.compare(input.password, user.passwordHash);
    } catch {
      // e.g. invalid hash format in DB
      const error: any = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }
    if (!match) {
      const error: any = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

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

