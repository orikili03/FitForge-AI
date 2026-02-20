import { z } from "zod";

export const generateWorkoutSchema = z.object({
  timeCapMinutes: z.number().int().min(5).max(60),
  equipment: z.array(z.string()).default([]),
  goal: z.enum(["strength", "endurance", "mixed", "skill"]),
});

export const completeWorkoutSchema = z.object({
  workoutId: z.string(),
  rpe: z.number().int().min(1).max(10),
  completionTime: z.number().int().positive().optional(),
  roundsOrReps: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
});

