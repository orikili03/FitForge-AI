import type { FilteredMovement } from "./MovementFilterService.js";

// ─── WOD Template Types ───────────────────────────────────────────────────
export type WodProtocol =
    | "AMRAP"
    | "EMOM"
    | "FOR_TIME"
    | "TABATA"
    | "DEATH_BY"
    | "21_15_9"
    | "LADDER"
    | "CHIPPER"
    | "INTERVAL"
    | "STRENGTH_SINGLE"
    | "STRENGTH_SETS"
    | "REST_DAY"
    | "OTHER";

export interface AssembledWod {
    type: string;
    duration?: number;
    description: string;
    movements: string[];
    rounds?: number;
    movementItems: Array<{
        reps: number;
        name: string;
        weight?: string;
        distance?: string;
    }>;
}

export interface GeneratedWorkout {
    wod: AssembledWod;
    warmup: string[];
    scalingOptions: string[];
    intensityGuidance: string;
    intendedStimulus: string;
    timeDomain: string;
    movementEmphasis: string[];
    stimulusNote: string;
    equipmentPresetName?: string;
    equipmentUsed: string[];
}

// ─── Template Configuration ───────────────────────────────────────────────
interface TemplateConfig {
    movementCount: { min: number; max: number };
    repSchemes: number[][];
    description: (duration: number, movements: string[]) => string;
}

const TEMPLATES: Record<WodProtocol, TemplateConfig> = {
    AMRAP: {
        movementCount: { min: 3, max: 5 },
        repSchemes: [
            [10, 10, 10],
            [12, 9, 6],
            [15, 12, 9, 6],
            [8, 8, 8, 8],
            [10, 8, 6, 12, 10],
        ],
        description: (dur, mvs) =>
            `${dur}-Minute AMRAP:\n${mvs.join("\n")}`,
    },
    EMOM: {
        movementCount: { min: 2, max: 4 },
        repSchemes: [
            [8, 8],
            [10, 6],
            [5, 5, 5],
            [8, 6, 4, 10],
        ],
        description: (dur, mvs) =>
            `EMOM ${dur}:\n${mvs.map((m, i) => `Min ${i + 1}: ${m}`).join("\n")}`,
    },
    FOR_TIME: {
        movementCount: { min: 2, max: 4 },
        repSchemes: [
            [21, 15, 9],
            [15, 12, 9],
            [10, 10, 10],
            [20, 15, 10, 5],
        ],
        description: (_dur, mvs) =>
            `For Time:\n${mvs.join("\n")}`,
    },
    TABATA: {
        movementCount: { min: 2, max: 4 },
        repSchemes: [
            [20, 20],
            [20, 20, 20],
            [20, 20, 20, 20],
        ],
        description: (_dur, mvs) =>
            `Tabata (20s work / 10s rest × 8 rounds):\n${mvs.join("\n")}`,
    },
    DEATH_BY: {
        movementCount: { min: 1, max: 2 },
        repSchemes: [[1], [1, 1]],
        description: (_dur, mvs) =>
            `Death By:\nStart with 1 rep. Add 1 rep each minute.\n${mvs.join("\n")}`,
    },
    "21_15_9": {
        movementCount: { min: 2, max: 3 },
        repSchemes: [
            [21, 21],
            [21, 21, 21],
        ],
        description: (_dur, mvs) =>
            `21-15-9:\n${mvs.join("\n")}`,
    },
    LADDER: {
        movementCount: { min: 1, max: 2 },
        repSchemes: [[2, 2]],
        description: (dur, mvs) =>
            `${dur}-Minute Ladder:\nStart with 2 reps of each. Increase by 2 reps every round.\n${mvs.join("\n")}`,
    },
    CHIPPER: {
        movementCount: { min: 5, max: 8 },
        repSchemes: [
            [50, 40, 30, 20, 10],
            [30, 30, 30, 30, 30, 30],
            [100, 80, 60, 40, 20],
        ],
        description: (_dur, mvs) =>
            `Chipper (Complete in order):\n${mvs.join("\n")}`,
    },
    INTERVAL: {
        movementCount: { min: 2, max: 3 },
        repSchemes: [[10, 10, 10]],
        description: (dur, mvs) =>
            `Intervals (${dur} min total):\nComplete each round every 5 minutes.\n${mvs.join("\n")}`,
    },
    STRENGTH_SINGLE: {
        movementCount: { min: 1, max: 1 },
        repSchemes: [[1]],
        description: (_dur, mvs) =>
            `Max Strength:\nFind a heavy 1-rep max for:\n${mvs.join("\n")}`,
    },
    STRENGTH_SETS: {
        movementCount: { min: 1, max: 2 },
        repSchemes: [[5], [5, 5]],
        description: (_dur, mvs) =>
            `Strength Sets:\n5 sets of 5 reps (Rest 2-3 mins):\n${mvs.join("\n")}`,
    },
    REST_DAY: {
        movementCount: { min: 0, max: 0 },
        repSchemes: [[]],
        description: () => "Rest Day: Active recovery or total rest.",
    },
    OTHER: {
        movementCount: { min: 1, max: 5 },
        repSchemes: [[10, 10, 10, 10, 10]],
        description: (_dur, mvs) => `Modular Workout:\n${mvs.join("\n")}`,
    },
};

// ─── Stimulus Notes per Protocol ──────────────────────────────────────────
const STIMULUS_NOTES: Record<WodProtocol, string> = {
    AMRAP:
        "Maintain consistent pacing. Each round should take roughly the same time. Scale to keep moving.",
    EMOM:
        "Each movement should be completable within the minute with rest. If you can't finish, reduce reps.",
    FOR_TIME:
        "Push the pace but maintain form. Break sets strategically — don't go to failure early.",
    TABATA:
        "Max effort during 20s work intervals. The 10s rest is sacred — use every second.",
    DEATH_BY:
        "Start smooth. The early minutes should feel easy. The challenge is in the later rounds.",
    "21_15_9":
        "This is a sprint. Unbroken sets early, fast transitions. Aim for sub-10 minutes.",
    LADDER:
        "Focus on smooth transitions. The early sets will be very fast, but the volume builds quickly. Pace yourself.",
    CHIPPER:
        "A mental and physical test of stamina. Chip away at the large sets. Don't look at the whole list, just the movement in front of you.",
    INTERVAL:
        "Focus on consistent effort across intervals. Round times should be repeatable.",
    STRENGTH_SINGLE:
        "Focus on mechanics and absolute strength. Take full recovery between attempts.",
    STRENGTH_SETS:
        "Move the load with perfect form. Rest until you are fully ready for the next set.",
    REST_DAY:
        "Recovery is where the adaptation happens. Eat well and stay mobile.",
    OTHER:
        "Focus on the intended stimulus. Listen to your body.",
};

// ─── Warmup Generator (FUTURE FEATURE — see TASKS.md Step 4) ──────────
// function generateWarmup(movements: FilteredMovement[]): string[] {
//     const warmup: string[] = [
//         "2 min light jog or row",
//         "10 arm circles (each direction)",
//         "10 leg swings (each side)",
//     ];
//
//     // Add movement-specific prep
//     const families = new Set(
//         movements.map(
//             (m) => (m.movement as unknown as { family?: string }).family ?? ""
//         )
//     );
//
//     if (families.has("squat")) warmup.push("10 air squats");
//     if (families.has("press"))
//         warmup.push("10 PVC pass-throughs", "5 strict press (empty bar)");
//     if (families.has("pull")) warmup.push("5 scap pull-ups", "5 ring rows");
//     if (families.has("hinge"))
//         warmup.push("10 good mornings (empty bar)", "5 Romanian deadlifts");
//     if (families.has("olympic"))
//         warmup.push("5 hang muscle cleans (empty bar)", "5 front squats");
//
//     return warmup;
// }

// ─── Scaling Options Generator ────────────────────────────────────────────
function generateScalingOptions(movements: FilteredMovement[]): string[] {
    const options: string[] = [];

    for (const fm of movements) {
        const m = fm.movement as unknown as {
            name: string;
            isLoaded: boolean;
            family?: string;
        };

        if (m.isLoaded) {
            options.push(`Reduce load by 20-30%`);
            break; // Only suggest load reduction once
        }
    }

    options.push("Reduce reps by 30%");

    // Movement-specific substitutions
    for (const fm of movements) {
        const name = fm.resolvedName.toLowerCase();
        if (name.includes("pull-up"))
            options.push("Ring rows instead of pull-ups");
        if (name.includes("push-up"))
            options.push("Elevated push-ups (hands on box)");
        if (name.includes("deadlift"))
            options.push("Kettlebell deadlift instead of barbell");
        if (name.includes("run")) options.push("Reduce run distance to 200m");
        if (name.includes("double-under"))
            options.push("Single-unders (2:1 ratio)");
    }

    return [...new Set(options)]; // Deduplicate
}

// ─── Utility ──────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * WodAssemblyService
 *
 * Takes filtered & variance-ranked movements and assembles them into
 * a complete workout using CrossFit-standard templates.
 */
export class WodAssemblyService {
    /**
     * Assemble a complete workout.
     */
    assemble(
        rankedMovements: FilteredMovement[],
        protocol: string,
        durationMinutes: number,
        equipmentPresetName?: string
    ): GeneratedWorkout {
        // Resolve protocol
        const resolvedProtocol = this.resolveProtocol(protocol, durationMinutes);
        const template = TEMPLATES[resolvedProtocol];

        // Select movements (top-ranked, within template limits)
        const count = Math.min(
            Math.max(template.movementCount.min, 3),
            template.movementCount.max,
            rankedMovements.length
        );

        // Take top candidates, shuffled for variety within the top tier
        const topCandidates = rankedMovements.slice(
            0,
            Math.min(count * 2, rankedMovements.length)
        );
        const selected = shuffleArray(topCandidates).slice(0, count);

        // Pick rep scheme
        const validSchemes = template.repSchemes.filter(
            (s) => s.length >= count
        );
        const repScheme =
            validSchemes.length > 0
                ? pickRandom(validSchemes)
                : template.repSchemes[0];

        // Build movement items
        const movementItems = selected.map((fm, i) => {
            const reps = repScheme[i] ?? repScheme[0];
            const item: {
                reps: number;
                name: string;
                weight?: string;
                distance?: string;
            } = {
                reps,
                name: fm.resolvedName,
            };

            if (fm.defaultLoadKg) {
                item.weight = `${fm.defaultLoadKg}kg`;
            }

            return item;
        });

        const movementStrings = movementItems.map((item) => {
            let s = `${item.reps} ${item.name}`;
            if (item.weight) s += ` (${item.weight})`;
            if (item.distance) s += ` ${item.distance}`;
            return s;
        });

        // Build WOD description
        const description = template.description(durationMinutes, movementStrings);

        // Determine rounds for EMOM/FOR_TIME
        let rounds: number | undefined;
        if (resolvedProtocol === "EMOM") {
            rounds = Math.floor(durationMinutes / count) || durationMinutes;
        } else if (resolvedProtocol === "FOR_TIME") {
            rounds = 3; // default 3 rounds
        } else if (resolvedProtocol === "21_15_9") {
            rounds = 3;
        }

        // Collect equipment used
        const equipmentUsed = [
            ...new Set(
                selected.flatMap(
                    (fm) =>
                        (fm.movement as unknown as { equipmentRequired: string[] })
                            .equipmentRequired ?? []
                )
            ),
        ];

        // Determine modality emphasis
        const movementEmphasis = [
            ...new Set(
                selected.map(
                    (fm) =>
                        (fm.movement as unknown as { modality: string }).modality
                )
            ),
        ];

        // Time domain classification
        const timeDomain =
            durationMinutes <= 12
                ? "Short (Sprint)"
                : durationMinutes <= 22
                    ? "Medium (Sustained)"
                    : "Long (Aerobic)";

        // Intensity guidance
        const intensityGuidance =
            durationMinutes <= 12
                ? "High intensity — push the pace, brief rest only."
                : durationMinutes <= 22
                    ? "Moderate-high — find a sustainable rhythm."
                    : "Moderate — pace yourself, this is a longer effort.";

        return {
            wod: {
                type: resolvedProtocol.replace("_", "-"),
                duration: durationMinutes,
                description,
                movements: movementStrings,
                rounds,
                movementItems,
            },
            warmup: [], // generateWarmup(selected),
            scalingOptions: generateScalingOptions(selected),
            intensityGuidance,
            intendedStimulus: `${timeDomain} — ${movementEmphasis
                .map((m) =>
                    m === "G"
                        ? "Gymnastics"
                        : m === "W"
                            ? "Weightlifting"
                            : "Monostructural"
                )
                .join(" + ")}`,
            timeDomain,
            movementEmphasis,
            stimulusNote: STIMULUS_NOTES[resolvedProtocol],
            equipmentPresetName,
            equipmentUsed,
        };
    }

    /**
     * Resolve "recommended" protocol to an actual protocol based on duration.
     */
    private resolveProtocol(
        protocol: string,
        durationMinutes: number
    ): WodProtocol {
        if (protocol !== "recommended") {
            // Validate it's a known protocol
            const valid: WodProtocol[] = [
                "AMRAP",
                "EMOM",
                "FOR_TIME",
                "TABATA",
                "DEATH_BY",
                "21_15_9",
            ];
            if (valid.includes(protocol as WodProtocol)) {
                return protocol as WodProtocol;
            }
            return "AMRAP"; // fallback
        }

        // "Recommended" — pick based on duration
        if (durationMinutes <= 10) {
            return pickRandom(["TABATA", "EMOM", "21_15_9", "LADDER"]);
        } else if (durationMinutes <= 20) {
            return pickRandom(["AMRAP", "EMOM", "FOR_TIME", "LADDER"]);
        } else {
            return pickRandom(["AMRAP", "FOR_TIME", "CHIPPER"]);
        }
    }
}

// Singleton export
export const wodAssemblyService = new WodAssemblyService();
