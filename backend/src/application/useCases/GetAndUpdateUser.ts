import { UserRepository } from "../../domain/repositories/UserRepository";
import { UserProfileDTO, UpdateUserProfileRequestDTO } from "../dto/UserDTO";

export class GetCurrentUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(userId: string): Promise<UserProfileDTO> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      fitnessLevel: user.fitnessLevel,
      goals: user.goals,
      movementConstraints: user.movementConstraints,
      injuryFlags: user.injuryFlags,
      equipment: user.equipment,
    };
  }
}

export class UpdateUserProfileUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(userId: string, input: UpdateUserProfileRequestDTO): Promise<UserProfileDTO> {
    const user = await this.userRepo.updateProfile(userId, input);
    return {
      id: user.id,
      email: user.email,
      fitnessLevel: user.fitnessLevel,
      goals: user.goals,
      movementConstraints: user.movementConstraints,
      injuryFlags: user.injuryFlags,
      equipment: user.equipment,
    };
  }
}

