import { z } from "zod";

export const updateUserSchema = z.object({
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  goals: z.array(z.string()).optional(),
  movementConstraints: z.array(z.string()).optional(),
  injuryFlags: z.array(z.string()).optional(),
});

