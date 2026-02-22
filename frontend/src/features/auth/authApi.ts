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

function getApiErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
  return data?.error?.message ?? fallback;
}

export function useLogin() {
  return useMutation<AuthResponse, Error, AuthPayload>({
    mutationFn: async (payload) => {
      try {
        const res = await apiClient.post("/auth/login", payload);
        return res.data.data;
      } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Unable to sign in. Please try again."));
      }
    },
  });
}

export function useRegister() {
  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: async (payload) => {
      try {
        const res = await apiClient.post("/auth/register", payload);
        return res.data.data;
      } catch (err: unknown) {
        throw new Error(
          getApiErrorMessage(err, "Unable to create account. Check your connection and try again.")
        );
      }
    },
  });
}

