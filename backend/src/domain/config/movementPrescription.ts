/**
 * Movement and equipment abbreviations for prescriptions.
 * Names are stored abbreviated (e.g. "SA KB DL"); use expandForDisplay() for user-facing text.
 */

import { getSuggestedWeight } from "./movementCatalog";
import { EQUIPMENT_TO_MOVEMENTS } from "./equipmentMovementMap";

/** Movement ID -> abbreviation used in prescriptions (must exist in abbreviations.ABBREV_TO_FULL) */
export const MOVEMENT_ABBREV: Record<string, string> = {
  deadlift: "DL",
  "front squat": "FS",
  "push press": "PP",
  "power clean": "PC",
  "pull-up": "PULL",
  "push-up": "PUSH",
  "air squat": "AS",
  burpee: "BP",
  row: "Row",
  "assault bike": "AB",
  run: "Run",
  "double-under": "DU",
};

/** Equipment ID (from user profile) -> abbreviation */
export const EQUIPMENT_ID_TO_ABBREV: Record<string, string> = {
  barbell: "BB",
  kettlebells: "KB",
  dumbbells: "DB",
};

/** Movements that commonly use single-arm when done with KB/DB */
const SINGLE_ARM_MOVEMENTS = new Set(["deadlift", "push press"]);

/**
 * Pick first equipment (by preference order) that user has and supports this movement.
 */
function pickEquipmentAbbrev(movementId: string, equipmentAvailable: string[]): string | null {
  const preferredOrder = movementId === "deadlift" ? ["barbell", "kettlebells", "dumbbells"] as const
    : movementId === "push press" ? ["barbell", "dumbbells"] as const
    : movementId === "front squat" || movementId === "power clean" ? ["barbell"] as const
    : [];
  for (const eqId of preferredOrder) {
    if (!equipmentAvailable.includes(eqId)) continue;
    const movements = EQUIPMENT_TO_MOVEMENTS[eqId];
    if (movements && movements.includes(movementId)) return EQUIPMENT_ID_TO_ABBREV[eqId] ?? null;
  }
  return null;
}

/**
 * Build abbreviated prescription name: equipment + movement, optionally with SA/DA.
 * e.g. "BB DL", "SA KB DL", "Row" (no equipment abbrev for cardio).
 */
export function getPrescriptionName(
  movementId: string,
  equipmentAvailable: string[],
  options?: { singleArm?: boolean; doubleArm?: boolean }
): string {
  const movAbbrev = MOVEMENT_ABBREV[movementId];
  if (!movAbbrev) {
    return movementId.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  const eqAbbrev = pickEquipmentAbbrev(movementId, equipmentAvailable);
  if (!eqAbbrev) {
    return movAbbrev;
  }
  const useSingleArm = options?.singleArm ?? (SINGLE_ARM_MOVEMENTS.has(movementId) && eqAbbrev === "KB");
  const useDoubleArm = options?.doubleArm ?? false;
  if (useSingleArm) return `SA ${eqAbbrev} ${movAbbrev}`;
  if (useDoubleArm) return `DA ${eqAbbrev} ${movAbbrev}`;
  return `${eqAbbrev} ${movAbbrev}`;
}

export function getPrescriptionWeight(movementId: string): string | undefined {
  return getSuggestedWeight(movementId);
}
