/**
 * Movement-specific scaling options. Used to build scalingOptions in WorkoutSpec
 * from the chosen movements instead of a single static list.
 */

/** Movement ID -> scaling options (e.g. pull-up -> ring rows, banded). */
export const MOVEMENT_SCALING: Record<string, string[]> = {
  "pull-up": ["Ring rows", "Banded pull-ups", "Jumping pull-ups"],
  "push-up": ["Elevated push-ups (hands on box)", "Knee push-ups", "Wall push-ups"],
  "air squat": ["Reduce depth", "Box squat", "Assisted squat"],
  burpee: ["Step-back burpee", "No push-up burpee", "Box step-over"],
  deadlift: ["Reduce load 30-50%", "Kettlebell or dumbbell deadlift", "Sumo deadlift"],
  "front squat": ["Reduce load 30-50%", "Goblet squat", "Box squat"],
  "push press": ["Reduce load 30-50%", "Strict press", "Dumbbell press"],
  "power clean": ["Reduce load 30-50%", "Hang power clean", "Dumbbell clean"],
  row: ["Reduce pace", "Shorter intervals", "Bike or ski erg substitute"],
  "assault bike": ["Reduce RPM", "Shorter intervals", "Row or run substitute"],
  run: ["Bike or row substitute", "Reduce distance", "Walk/jog"],
  "double-under": ["Single-unders", "Low step", "Bike/row for same time"],
};

const DEFAULT_SCALING = [
  "Reduce loading by 30-50% for strength work.",
  "Reduce reps by 30%",
  "Scale gymnastics to ring rows / elevated push-ups.",
  "Replace high-impact monostructural with bike/row.",
];

/**
 * Scaling option label -> equipment IDs required (user must have at least one).
 * Options not listed are always shown (no equipment required).
 */
export const SCALING_REQUIRES_EQUIPMENT: Record<string, string[]> = {
  "Ring rows": ["rings"],
  "Banded pull-ups": [], // band not in catalog; treat as always available
  "Jumping pull-ups": ["pullup_bar"],
  "Elevated push-ups (hands on box)": ["box"],
  "Box squat": ["box"],
  "Box step-over": ["box"],
  "Kettlebell or dumbbell deadlift": ["kettlebells", "dumbbells"],
  "Goblet squat": ["kettlebells", "dumbbells"],
  "Dumbbell press": ["dumbbells"],
  "Dumbbell clean": ["dumbbells"],
  "Hang power clean": ["barbell"],
  "Bike or ski erg substitute": ["assault_bike", "rower"],
  "Row or run substitute": ["rower"],
  "Bike or row substitute": ["assault_bike", "rower"],
  "Bike/row for same time": ["assault_bike", "rower"],
};

function optionAllowed(option: string, equipmentAvailable: string[]): boolean {
  const required = SCALING_REQUIRES_EQUIPMENT[option];
  if (required === undefined || required.length === 0) return true;
  return required.some((id) => equipmentAvailable.includes(id));
}

/** Movements that typically use barbell for load; use "Reduce Barbell load X%" for these. */
const BARBELL_LOAD_MOVEMENTS = new Set(["deadlift", "front squat", "push press", "power clean"]);

/** Title-case movement id for display (e.g. "front squat" -> "Front Squat", "pull-up" -> "Pull-Up"). */
function humanizeMovementId(movementId: string): string {
  return movementId
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** If option is a generic "Reduce load X%" style, return "Reduce [Barbell/Movement] load X%"; else return as-is. */
function withMovementLabel(option: string, movementId: string): string {
  const lower = option.trim().toLowerCase();
  const loadMatch = lower.match(/^reduce\s+load(.*)$/) ?? lower.match(/^reduce\s+loading(.*)$/);
  if (loadMatch) {
    const suffix = loadMatch[1].trim(); // e.g. "30-50%" or " by 30-50% for strength work."
    const equipmentOrMovement = BARBELL_LOAD_MOVEMENTS.has(movementId)
      ? "Barbell"
      : humanizeMovementId(movementId);
    return suffix ? `Reduce ${equipmentOrMovement} load ${suffix}` : `Reduce ${equipmentOrMovement} load`;
  }
  return option;
}

/**
 * Returns scaling options for the given movements. Uses movement-specific
 * rules when available; otherwise appends default options. Deduplicates.
 * When equipmentAvailable is provided, only options feasible with that
 * equipment are included.
 * Load-reduction options are emitted as "Reduce [Movement] load X%" for clarity.
 */
export function getScalingForMovements(
  movements: string[],
  equipmentAvailable?: string[]
): string[] {
  const available = equipmentAvailable ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of movements) {
    const options = MOVEMENT_SCALING[m];
    if (options) {
      for (const o of options) {
        const label = withMovementLabel(o, m);
        if (!seen.has(label) && optionAllowed(o, available)) {
          seen.add(label);
          out.push(label);
        }
      }
    }
  }
  if (out.length === 0) {
    return DEFAULT_SCALING.filter((d) => optionAllowed(d, available));
  }
  for (const d of DEFAULT_SCALING) {
    if (!seen.has(d) && optionAllowed(d, available)) out.push(d);
  }
  return out;
}
