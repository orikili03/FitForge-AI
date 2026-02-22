/**
 * Stimulus-driven programming: defines intended workout stimulus and maps it to
 * protocol, duration, and movement count. Ensures generation is intentional, not random.
 * Aligns with CrossFit time domains and intensity variation.
 */

import type { ProgressionOutput } from "../services/aiAgents";

export type StimulusType =
  | "sprint"           // Short, high intensity (< ~12 min)
  | "short_metcon"     // 12–20 min, sustained effort
  | "medium_metcon"   // 20–25 min
  | "long_aerobic"     // 25+ min, pacing
  | "strength_bias"    // Heavy/skill emphasis, lower rep density
  | "skill";           // Technique/skill focus

export interface StimulusDecision {
  stimulus: StimulusType;
  /** WOD duration in minutes (not including warmup). */
  durationMinutes: number;
  /** Preferred protocol when user chose "recommended". */
  recommendedProtocol: "EMOM" | "AMRAP" | "FOR_TIME" | "TABATA" | "DEATH_BY" | "21_15_9";
  /** Number of movements to include (2–3 typical for metcon; 1–2 for strength/skill). */
  movementCount: number;
  /** Human-readable label for UI (e.g. "Sprint", "Long aerobic"). */
  intendedStimulusLabel: string;
}

/**
 * Derives stimulus from time cap, progression, and fatigue.
 * Deterministic: same inputs → same stimulus decision.
 */
export function decideStimulus(params: {
  timeCapMinutes: number;
  progression: ProgressionOutput;
  fatigueScore: number;
}): StimulusDecision {
  const { timeCapMinutes, progression, fatigueScore } = params;
  const highFatigue = fatigueScore > 0.7;
  const shortCap = timeCapMinutes <= 20;
  const longCap = timeCapMinutes >= 45;
  const mediumCap = !shortCap && !longCap;

  // Recovery override: avoid long or high-density sessions
  if (highFatigue) {
    const duration = shortCap ? 12 : mediumCap ? 20 : 30;
    return {
      stimulus: shortCap ? "sprint" : "short_metcon",
      durationMinutes: duration,
      recommendedProtocol: "FOR_TIME",
      movementCount: 2,
      intendedStimulusLabel: "Recovery-friendly; steady pace, sound mechanics.",
    };
  }

  const targetLong = progression.targetDuration === "long";
  const duration = shortCap
    ? progression.targetDuration === "short"
      ? 10
      : 15
    : longCap
      ? targetLong ? 40 : 30
      : targetLong ? 28 : 20;
  const stimulus: StimulusType = shortCap
    ? "sprint"
    : duration >= 30
      ? "long_aerobic"
      : duration >= 22
        ? "medium_metcon"
        : "short_metcon";
  // Intentionally never recommend 21_15_9: it focuses on speed, stamina, and cardio and should be used sparingly (user choice only).
  const recommendedProtocol =
    shortCap ? "FOR_TIME" : duration >= 25 ? "AMRAP" : "AMRAP";
  return {
    stimulus,
    durationMinutes: duration,
    recommendedProtocol,
    movementCount: 3,
    intendedStimulusLabel:
      stimulus === "sprint"
        ? "Sprint; high intensity, short time domain."
        : stimulus === "long_aerobic"
          ? "Long aerobic; pacing and consistency."
          : "Medium metcon; varied intensity.",
  };
}
