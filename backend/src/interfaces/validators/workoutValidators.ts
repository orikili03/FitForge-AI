import { z } from "zod";

export const generateWorkoutSchema = z.object({
  timeCapMinutes: z.number().int().min(5).max(60),
  equipment: z.array(z.string()).default([]),
  goal: z.enum(["strength", "endurance", "mixed", "skill"]),
  protocol: z
    .enum(["recommended", "EMOM", "AMRAP", "FOR_TIME", "TABATA", "DEATH_BY", "21_15_9"])
    .default("recommended"),
});

export const completeWorkoutSchema = z.object({
  workoutId: z.string(),
  completionTime: z.number().int().positive().optional(),
  roundsOrReps: z.number().int().positive().optional(),
});

