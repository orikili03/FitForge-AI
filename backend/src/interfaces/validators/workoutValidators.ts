import { z } from "zod";

export const generateWorkoutSchema = z.object({
  timeCapMinutes: z.number().int().min(5).max(60),
  equipment: z.array(z.string()).default([]),
  protocol: z
    .enum(["recommended", "EMOM", "AMRAP", "FOR_TIME", "TABATA", "DEATH_BY", "21_15_9"])
    .default("recommended"),
  injuries: z.string().max(500).optional(),
  presetName: z.string().max(100).optional(),
});

const wodSchema = z.object({
  type: z.string(),
  duration: z.number().optional(),
  description: z.string(),
  movements: z.array(z.string()),
  rounds: z.number().optional(),
  movementItems: z.array(z.object({
    reps: z.number(),
    name: z.string(),
    weight: z.string().optional(),
    distance: z.string().optional(),
  })).optional(),
});

export const completeWorkoutSchema = z.object({
  workoutId: z.string(),
  completionTime: z.number().int().positive().optional(),
  roundsOrReps: z.number().int().positive().optional(),
  spec: z.object({
    warmup: z.array(z.string()),
    wod: wodSchema,
    scalingOptions: z.array(z.string()),
    intensityGuidance: z.string(),
    finisher: z.array(z.string()).optional(),
    intendedStimulus: z.string().optional(),
    timeDomain: z.string().optional(),
    movementEmphasis: z.array(z.string()).optional(),
    stimulusNote: z.string().optional(),
    equipmentPresetName: z.string().optional(),
    equipmentUsed: z.array(z.string()).optional(),
  }).optional(),
});

