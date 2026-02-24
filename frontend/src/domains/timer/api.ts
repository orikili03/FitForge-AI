import { z } from "zod";

export const workoutTimerTypeSchema = z.enum(["EMOM", "AMRAP", "FOR_TIME", "TABATA"]);
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
