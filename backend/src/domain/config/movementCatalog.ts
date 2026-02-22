/**
 * Single source of truth for movement taxonomy: domain, patterns, and display metadata.
 * Aligns with CrossFit methodology: functional patterns (push/pull/hinge/squat/core/carry/locomotion)
 * and mixed modalities (strength / gymnastics / monostructural).
 * Used by movementTags, equipmentMovementMap, scalingRules, and programming agents.
 */

export type Domain = "strength" | "gymnastics" | "monostructural";
export type Pattern = "squat" | "hinge" | "push" | "pull" | "core" | "locomotion" | "carry";

export interface MovementEntry {
  id: string;
  domain: Domain;
  patterns: Pattern[];
  /** Suggested load for display (e.g. "60kg"); optional for bodyweight/mono. */
  suggestedWeight?: string;
  /** Primary pattern for balance logic (prefer one per workout when possible). */
  primaryPattern: Pattern;
}

const ENTRIES: MovementEntry[] = [
  { id: "deadlift", domain: "strength", patterns: ["hinge"], primaryPattern: "hinge", suggestedWeight: "60kg" },
  { id: "front squat", domain: "strength", patterns: ["squat"], primaryPattern: "squat", suggestedWeight: "40kg" },
  { id: "push press", domain: "strength", patterns: ["push"], primaryPattern: "push", suggestedWeight: "40kg" },
  { id: "power clean", domain: "strength", patterns: ["hinge", "pull"], primaryPattern: "hinge", suggestedWeight: "40kg" },
  { id: "pull-up", domain: "gymnastics", patterns: ["pull"], primaryPattern: "pull" },
  { id: "push-up", domain: "gymnastics", patterns: ["push"], primaryPattern: "push" },
  { id: "air squat", domain: "gymnastics", patterns: ["squat"], primaryPattern: "squat" },
  { id: "burpee", domain: "gymnastics", patterns: ["push", "hinge", "locomotion"], primaryPattern: "push" },
  { id: "row", domain: "monostructural", patterns: ["pull", "locomotion"], primaryPattern: "locomotion" },
  { id: "assault bike", domain: "monostructural", patterns: ["locomotion"], primaryPattern: "locomotion" },
  { id: "run", domain: "monostructural", patterns: ["locomotion"], primaryPattern: "locomotion" },
  { id: "double-under", domain: "monostructural", patterns: ["locomotion"], primaryPattern: "locomotion" },
];

const BY_ID = new Map<string, MovementEntry>(ENTRIES.map((e) => [e.id, e]));

export function getMovementEntry(movementId: string): MovementEntry | undefined {
  return BY_ID.get(movementId);
}

export function getDomain(movementId: string): Domain | undefined {
  return BY_ID.get(movementId)?.domain;
}

export function getPatterns(movementId: string): Pattern[] {
  return BY_ID.get(movementId)?.patterns ?? [];
}

export function getPrimaryPattern(movementId: string): Pattern | undefined {
  return BY_ID.get(movementId)?.primaryPattern;
}

export function getSuggestedWeight(movementId: string): string | undefined {
  return BY_ID.get(movementId)?.suggestedWeight;
}

/** All movement IDs in a deterministic order (for pool iteration). */
export const ALL_MOVEMENT_IDS = ENTRIES.map((e) => e.id);

/** Movements by domain for programming pools. */
export const MOVEMENTS_BY_DOMAIN: Record<Domain, string[]> = {
  strength: ENTRIES.filter((e) => e.domain === "strength").map((e) => e.id),
  gymnastics: ENTRIES.filter((e) => e.domain === "gymnastics").map((e) => e.id),
  monostructural: ENTRIES.filter((e) => e.domain === "monostructural").map((e) => e.id),
};
