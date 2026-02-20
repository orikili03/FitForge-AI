import { UserModel } from "../database/models";
import {
  CreateUserData,
  UpdateUserEquipmentData,
  UpdateUserProfileData,
  UserRepository,
} from "../../domain/repositories/UserRepository";
import { User } from "../../domain/entities/User";

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const record = await UserModel.findById(id).exec();
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await UserModel.findOne({ email }).exec();
    return record ? this.toDomain(record) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const record = await UserModel.create({
      email: data.email,
      passwordHash: data.passwordHash,
      fitnessLevel: data.fitnessLevel,
      goals: data.goals,
      equipmentAccess: data.equipmentAccess,
      movementConstraints: data.movementConstraints,
      injuryFlags: data.injuryFlags,
    });
    return this.toDomain(record);
  }

  async updateProfile(id: string, data: UpdateUserProfileData): Promise<User> {
    const record = await UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(data.fitnessLevel && { fitnessLevel: data.fitnessLevel }),
          ...(data.goals && { goals: data.goals }),
          ...(data.movementConstraints && { movementConstraints: data.movementConstraints }),
          ...(data.injuryFlags && { injuryFlags: data.injuryFlags }),
        },
      },
      { new: true }
    ).exec();
    if (!record) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return this.toDomain(record);
  }

  async updateEquipment(id: string, data: UpdateUserEquipmentData): Promise<User> {
    const record = await UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          equipment: {
            selected: data.selected,
            customPresets: data.customPresets,
          },
        },
      },
      { new: true }
    ).exec();

    if (!record) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return this.toDomain(record);
  }

  private toDomain(record: any): User {
    return new User({
      id: record._id.toString(),
      email: record.email,
      passwordHash: record.passwordHash,
      fitnessLevel: record.fitnessLevel,
      goals: record.goals,
      equipmentAccess: record.equipmentAccess,
      movementConstraints: record.movementConstraints,
      injuryFlags: record.injuryFlags,
      equipment: {
        selected: record.equipment?.selected ?? [],
        customPresets: record.equipment?.customPresets ?? [],
      },
    });
  }
}

