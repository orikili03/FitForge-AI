import { User } from "../entities/User";

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fitnessLevel: string;
  goals: string[];
  equipmentAccess: string[];
  movementConstraints: string[];
  injuryFlags: string[];
}

export interface UpdateUserProfileData {
  fitnessLevel?: string;
  goals?: string[];
  movementConstraints?: string[];
  injuryFlags?: string[];
}

export interface EquipmentSelectionDTO {
  id: string;
  minWeight?: number;
  maxWeight?: number;
}

export interface CustomEquipmentPresetDTO {
  id: string;
  name: string;
  selected: EquipmentSelectionDTO[];
}

export interface UpdateUserEquipmentData {
  selected: EquipmentSelectionDTO[];
  customPresets: CustomEquipmentPresetDTO[];
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  updateProfile(id: string, data: UpdateUserProfileData): Promise<User>;
  updateEquipment(id: string, data: UpdateUserEquipmentData): Promise<User>;
}

