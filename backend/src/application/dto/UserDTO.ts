export interface UserProfileDTO {
  id: string;
  email: string;
  fitnessLevel: string;
  goals: string[];
  movementConstraints: string[];
  injuryFlags: string[];
  equipment: {
    selected: Array<{ id: string; minWeight?: number; maxWeight?: number }>;
    customPresets: Array<{
      id: string;
      name: string;
      selected: Array<{ id: string; minWeight?: number; maxWeight?: number }>;
    }>;
  };
}

export interface UpdateUserProfileRequestDTO {
  fitnessLevel?: string;
  goals?: string[];
  movementConstraints?: string[];
  injuryFlags?: string[];
}

