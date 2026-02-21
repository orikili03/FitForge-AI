/**
 * Maps equipment IDs (aligned with frontend equipment catalog) to movements
 * that can be performed with that equipment. Used to constrain allowed movements
 * based on user's available equipment.
 */

/** Movements that require no equipment (bodyweight / locomotion only). */
export const BODYWEIGHT_MOVEMENTS = ["air squat", "burpee", "push-up", "run"] as const;

/**
 * Equipment ID -> list of movement IDs that this equipment enables.
 * Movement IDs must match those used in MOVEMENT_CATEGORIES (SimpleAgents).
 */
export const EQUIPMENT_TO_MOVEMENTS: Record<string, string[]> = {
  // Conditioning
  rower: ["row"],
  assault_bike: ["assault bike"],
  // Gymnastics
  pullup_bar: ["pull-up"],
  rings: ["pull-up", "push-up"],
  jump_rope: ["double-under"],
  abmat: [],
  // Strength
  barbell: ["deadlift", "front squat", "push press", "power clean"],
  dumbbells: ["deadlift", "push press"],
  kettlebells: ["deadlift"],
  plates: ["deadlift", "front squat", "push press", "power clean"],
  rack: ["front squat", "push press", "power clean"],
  // Optional
  wall_ball: [],
  box: ["burpee"],
  mat: ["push-up", "air squat", "burpee"],
  chalk: [],
  coach_mode: [],
};

/** All movement IDs that can be enabled by some equipment or bodyweight. */
export const ALL_MOVEMENT_IDS = [
  "deadlift",
  "front squat",
  "push press",
  "power clean",
  "pull-up",
  "push-up",
  "air squat",
  "burpee",
  "row",
  "assault bike",
  "run",
  "double-under",
] as const;

/**
 * Returns the set of movement IDs allowed given equipment list.
 * If equipment is empty, returns only bodyweight movements.
 */
export function getMovementsForEquipment(equipmentAvailable: string[]): Set<string> {
  const out = new Set<string>(BODYWEIGHT_MOVEMENTS);
  if (equipmentAvailable.length === 0) {
    return out;
  }
  for (const eqId of equipmentAvailable) {
    const movements = EQUIPMENT_TO_MOVEMENTS[eqId];
    if (movements) {
      for (const m of movements) out.add(m);
    }
  }
  return out;
}
