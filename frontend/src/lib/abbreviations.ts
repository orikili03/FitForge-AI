/**
 * Abbreviations used internally for movements (KB, BB, DL, SA, DA, etc.).
 * Only full terms are shown to end users via expandForDisplay().
 */

export const ABBREV_TO_FULL: Record<string, string> = {
    KB: "Kettlebell",
    BB: "Barbell",
    DB: "Dumbbell",
    VS: "vest",
    SA: "Single Arm",
    DA: "Double Arm",
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
 */
export function expandForDisplay(text: string): string {
    if (!text || typeof text !== "string") return text;
    return text
        .trim()
        .split(/\s+/)
        .map((token) => ABBREV_TO_FULL[token] ?? token)
        .join(" ");
}
