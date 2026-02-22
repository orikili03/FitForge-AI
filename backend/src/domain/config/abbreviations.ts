/**
 * Abbreviations used internally for movements (e.g. KB, BB, DL, SA, DA).
 * Only full terms are shown to end users via expandForDisplay().
 */

export const ABBREV_TO_FULL: Record<string, string> = {
  // Equipment
  KB: "Kettlebell",
  BB: "Barbell",
  DB: "Dumbbell",
  VS: "vest",
  // Modifiers
  SA: "Single Arm",
  DA: "Double Arm",
  // Movements
  DL: "Deadlift",
  FS: "Front Squat",
  BS: "Back Squat",
  PP: "Push Press",
  PC: "Power Clean",
  PULL: "Pull-Up",
  PUSH: "Push-Up",
  Row: "Row",
  AB: "Assault Bike",
  Run: "Run",
  DU: "Double-Under",
  AS: "Air Squat",
  BP: "Burpee",
};

/**
 * Expands abbreviated movement text to full terms for display.
 * e.g. "SA KB DL" -> "Single Arm Kettlebell Deadlift", "BB FS" -> "Barbell Front Squat"
 */
export function expandForDisplay(text: string): string {
  if (!text || typeof text !== "string") return text;
  return text
    .trim()
    .split(/\s+/)
    .map((token) => ABBREV_TO_FULL[token] ?? token)
    .join(" ");
}
