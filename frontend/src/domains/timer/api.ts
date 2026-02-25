import { z } from "zod";

export const workoutTimerTypeSchema = z.enum(["AMRAP", "FOR_TIME", "EMOM", "TABATA", "DEATH_BY", "21_15_9", "CHIPPER", "LADDER", "INTERVAL", "STRENGTH_SINGLE", "STRENGTH_SETS", "REST_DAY", "OTHER"]);
export type WorkoutTimerType = z.infer<typeof workoutTimerTypeSchema>;

export type TimerPhase = "WORK" | "REST";
export type TimerStatus = "idle" | "running" | "paused" | "finished";

export const timerConfigSchema = z.object({
    type: workoutTimerTypeSchema,
    totalRounds: z.number(),
    workSeconds: z.number(),
    restSeconds: z.number(),
    durationSeconds: z.number(),
    showRoundCounter: z.boolean(),
});
export type TimerConfig = z.infer<typeof timerConfigSchema>;

export const computedTimerStateSchema = z.object({
    round: z.number(),
    phase: z.enum(["WORK", "REST"]),
    displaySeconds: z.number(),
    phaseProgress: z.number(),
    isFinished: z.boolean(),
});
export type ComputedTimerState = z.infer<typeof computedTimerStateSchema>;

export const workoutSessionResultSchema = z.object({
    totalElapsed: z.number(),
    roundsCompleted: z.number(),
    config: timerConfigSchema,
    workoutId: z.string(),
});
export type WorkoutSessionResult = z.infer<typeof workoutSessionResultSchema>;
