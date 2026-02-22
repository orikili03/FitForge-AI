/**
 * Structured schema for coach-learning WOD references.
 * Used to store and analyze WODs from official archives (CrossFit.com, WODwell, etc.)
 * for deep analysis and synthesis — not for random delivery to users.
 * Aligns with WorkoutSpec and movementCatalog for later principled generation.
 */

import type { Domain, Pattern } from "../config/movementCatalog";

/** Protocol classification (CrossFit standard). */
export type WODProtocol =
  | "AMRAP"
  | "FOR_TIME"
  | "EMOM"
  | "TABATA"
  | "DEATH_BY"
  | "21_15_9"
  | "CHIPPER"
  | "LADDER"
  | "INTERVAL"
  | "STRENGTH_SINGLE"
  | "STRENGTH_SETS"
  | "REST_DAY"
  | "OTHER";

/** Primary energy system / stimulus (for classification). */
export type EnergySystem =
  | "strength"
  | "power"
  | "phosphagen_sprint"
  | "glycolytic"
  | "aerobic"
  | "mixed"
  | "skill";

/** Time domain bucket. */
export type TimeDomainBucket = "short" | "medium" | "long" | "varies" | "n/a";

/** Single movement reference within a WOD (for analysis). */
export interface WODMovementRef {
  /** Movement name or ID (align with movementCatalog when possible). */
  name: string;
  /** Reps, or null for "for time" / "max" / distance-only. */
  reps: number | null;
  /** Load (e.g. "60kg", "95#"); null for bodyweight/mono. */
  load: string | null;
  /** Distance (e.g. "400m", "500m"); null when not applicable. */
  distance: string | null;
  /** Domain if mapped to catalog. */
  domain?: Domain;
  /** Primary pattern if mapped. */
  primaryPattern?: Pattern;
}

/** Scaling option as written (Rx / Intermediate / Beginner). */
export interface ScalingTier {
  level: "rx" | "intermediate" | "beginner";
  description: string;
  movementRefs?: WODMovementRef[];
}

/** One analyzed WOD from an external source (for coach learning only). */
export interface WODReference {
  /** Unique id (e.g. source + date or slug). */
  id: string;
  /** Source: "crossfit.com", "wodwell", "curated", etc. */
  source: string;
  /** Optional source URL or date (e.g. "2026-02-21"). */
  sourceDate?: string;
  sourceUrl?: string;

  /** Protocol classification. */
  protocol: WODProtocol;
  /** Human-readable protocol line (e.g. "3 RFT", "AMRAP 20"). */
  protocolDescription: string;
  /** Duration in minutes if fixed/capped; null for "for time" or strength. */
  durationMinutes: number | null;
  /** Time domain bucket. */
  timeDomain: TimeDomainBucket;
  /** Primary energy system / stimulus. */
  energySystem: EnergySystem;

  /** Structured movement refs (order preserved). */
  movements: WODMovementRef[];
  /** Modalities present (G/W/M). */
  modalities: Domain[];
  /** Primary patterns (for balance analysis). */
  patterns: Pattern[];

  /** Equipment required (barbell, dumbbell, rower, etc.). */
  equipment: string[];
  /** Scaling tiers if provided by source. */
  scalingTiers?: ScalingTier[];
  /** Raw stimulus/strategy note from source. */
  stimulusNote?: string;
  /** Optional benchmark name (e.g. "Nancy", "Fran"). */
  benchmarkName?: string;
}

/** Summary stats for coach intelligence (aggregated from WODReferences). */
export interface WODReferenceSummary {
  totalCount: number;
  byProtocol: Record<WODProtocol, number>;
  byTimeDomain: Record<TimeDomainBucket, number>;
  byEnergySystem: Record<EnergySystem, number>;
  modalitySpread: { gymnastics: number; strength: number; monostructural: number };
  patternSpread: Record<Pattern, number>;
}
