import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/[0-9]/, "Password must include at least one number"),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

