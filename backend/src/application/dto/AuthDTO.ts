export interface RegisterRequestDTO {
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

