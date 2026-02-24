import { z } from 'zod';

// ----- Zod schemas for the WOD API -----
export const movementSchema = z.object({
    id: z.string(),
    name: z.string(),
    reps: z.string(),
    load: z.string().optional(),
    description: z.string().optional(),
});

export const todayWodSchema = z.object({
    id: z.string(),
    title: z.string(),
    movements: z.array(movementSchema),
    // timer is in seconds; optional because some WODs are not timed
    timer: z.number().optional(),
});

export type Movement = z.infer<typeof movementSchema>;
export type TodayWod = z.infer<typeof todayWodSchema>;
