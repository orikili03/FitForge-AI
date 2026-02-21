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
  "Scale gymnastics to ring rows / elevated push-ups.",
  "Replace high-impact monostructural with bike/row.",
];

/**
 * Returns scaling options for the given movements. Uses movement-specific
 * rules when available; otherwise appends default options. Deduplicates.
 */
export function getScalingForMovements(movements: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of movements) {
    const options = MOVEMENT_SCALING[m];
    if (options) {
      for (const o of options) {
        if (!seen.has(o)) {
          seen.add(o);
          out.push(o);
        }
      }
    }
  }
  if (out.length === 0) {
    return [...DEFAULT_SCALING];
  }
  for (const d of DEFAULT_SCALING) {
    if (!seen.has(d)) out.push(d);
  }
  return out;
}
