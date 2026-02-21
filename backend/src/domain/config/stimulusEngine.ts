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
 * Derives stimulus from time cap, goal, progression, and fatigue.
 * Deterministic: same inputs → same stimulus decision.
 */
export function decideStimulus(params: {
  timeCapMinutes: number;
  goal: "strength" | "endurance" | "mixed" | "skill";
  progression: ProgressionOutput;
  fatigueScore: number;
}): StimulusDecision {
  const { timeCapMinutes, goal, progression, fatigueScore } = params;
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

  switch (goal) {
    case "strength":
      return {
        stimulus: "strength_bias",
        durationMinutes: shortCap ? 15 : mediumCap ? 25 : 35,
        recommendedProtocol: "EMOM",
        movementCount: 2,
        intendedStimulusLabel: "Strength-bias; quality reps, then conditioning if time.",
      };
    case "skill":
      return {
        stimulus: "skill",
        durationMinutes: shortCap ? 15 : mediumCap ? 20 : 30,
        recommendedProtocol: "EMOM",
        movementCount: 2,
        intendedStimulusLabel: "Skill/technique focus; controlled intensity.",
      };
    case "endurance":
      return {
        stimulus: longCap ? "long_aerobic" : mediumCap ? "medium_metcon" : "short_metcon",
        durationMinutes: shortCap ? 15 : mediumCap ? 25 : 40,
        recommendedProtocol: "AMRAP",
        movementCount: 3,
        intendedStimulusLabel: longCap ? "Long aerobic; sustainable pace." : "Sustained effort; manage pace.",
      };
    case "mixed":
    default: {
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
  }
}
