export interface RegisterRequestDTO {
  goals: string[];
  equipmentAccess: string[];
  movementConstraints: string[];
  injuryFlags: string[];
  email: string;
  password: string;
  fitnessLevel: string;
}

export interface AuthResponseDTO {
  token: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

