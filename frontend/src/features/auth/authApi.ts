import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";

interface AuthPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends AuthPayload {
  fitnessLevel: "beginner" | "intermediate" | "advanced";
}

interface AuthResponse {
  token: string;
}

export function useLogin() {
  return useMutation<AuthResponse, Error, AuthPayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/auth/login", payload);
      return res.data.data;
    },
  });
}

export function useRegister() {
  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/auth/register", payload);
      return res.data.data;
    },
  });
}

