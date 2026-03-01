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
    | "REST_DAY";

export type WodCategory = "sprint" | "metcon" | "long";

export type RepScheme = number[] | "MAX_REPS";

export interface AssembledWod {
    type: string;
    protocol: WodProtocol;
    category: WodCategory;
    duration?: number;
    description: string;
    movements: string[];
    rounds?: number;
    movementItems: Array<{
        reps: number;
        isMaxReps?: boolean;
        name: string;
        weight?: string;
        distance?: string;
    }>;
    ladderType?: "ascending" | "descending" | "pyramid";
    scoringType?: "AMRAP" | "FOR_TIME";
}

export interface GeneratedWorkout {
    wod: AssembledWod;
    warmup: string[];
    scalingOptions: string[];
    intensityGuidance: string;
    intendedStimulus: string;
    energySystem: string;
    primaryStimulus: string;
    timeDomain: string;
    movementEmphasis: string[];
    stimulusNote: string;
    equipmentPresetName?: string;
    equipmentUsed: string[];
}

// ─── Template Configuration ───────────────────────────────────────────────
interface TemplateConfig {
    movementCount: { min: number; max: number };
    repSchemes: RepScheme[];
    description: (duration: number, movements: string[], ladderType?: string, scoringType?: string) => string;
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
        description: (dur, mvs, _lt, st) =>
            st === "FOR_TIME" ? `For Time (Cap ${dur} min):\n${mvs.join("\n")}` : `For Time:\n${mvs.join("\n")}`,
    },
    TABATA: {
        movementCount: { min: 2, max: 4 },
        repSchemes: ["MAX_REPS"],
        description: (_dur, mvs) =>
            `Tabata (20s work / 10s rest × 8 rounds):\n${mvs.join("\n")}`,
    },
    DEATH_BY: {
        movementCount: { min: 1, max: 2 },
        repSchemes: [[1], [1, 1]],
        description: (dur, mvs) =>
            `Death By (Cap ${dur} min):\nStart with 1 rep. Add 1 rep each minute.\n${mvs.join("\n")}`,
    },
    "21_15_9": {
        movementCount: { min: 2, max: 3 },
        repSchemes: [
            [21, 15, 9],
        ],
        description: (_dur, mvs) =>
            `21-15-9:\n${mvs.join("\n")}`,
    },
    LADDER: {
        movementCount: { min: 1, max: 2 },
        repSchemes: [[2, 2]],
        description: (dur, mvs, lt, st) => {
            const prefix = lt === "ascending" ? "Ascending" : lt === "descending" ? "Descending" : "Pyramid";
            const suffix = st === "AMRAP" ? `(${dur}-Minute Clock)` : `(For Time - Cap ${dur} min)`;
            const details = lt === "ascending" ? "Increase by 2 reps every round." : "Decrease reps every round.";
            return `${prefix} Ladder ${suffix}:\n${details}\n${mvs.join("\n")}`;
        }
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
        description: (dur, mvs) =>
            `Max Strength (${dur} min Window):\nFind a heavy 1-rep max for:\n${mvs.join("\n")}`,
    },
    STRENGTH_SETS: {
        movementCount: { min: 1, max: 2 },
        repSchemes: [[5], [5, 5], [3], [3, 3]],
        description: (dur, mvs) =>
            `Strength Sets (${dur} min Window):\nWorking sets (Rest 2-3 mins):\n${mvs.join("\n")}`,
    },
    REST_DAY: {
        movementCount: { min: 0, max: 0 },
        repSchemes: [[]],
        description: () => "Rest Day: Active recovery or total rest.",
    },
};

// ─── Stimulus Alignment Metadata ───────────────────────────────────────────
interface StimulusMetaData {
    energySystem: string;
    primaryStimulus: string;
    stimulusNote: string;
}

const STIMULUS_METADATA: Record<WodProtocol, StimulusMetaData> = {
    AMRAP: {
        energySystem: "Glycolytic / Oxidative",
        primaryStimulus: "Sustained effort, manage muscle burn.",
        stimulusNote: "Maintain consistent pacing. Each round should take roughly the same time. Scale to keep moving.",
    },
    EMOM: {
        energySystem: "Mixed / Neuromuscular",
        primaryStimulus: "Consistent performance under interval fatigue.",
        stimulusNote: "Each movement should be completable within the minute with rest. If you can't finish, reduce reps.",
    },
    FOR_TIME: {
        energySystem: "Mixed",
        primaryStimulus: "Task completion under time pressure.",
        stimulusNote: "Push the pace but maintain form. Break sets strategically — don't go to failure early.",
    },
    TABATA: {
        energySystem: "Phosphagen",
        primaryStimulus: "Maximal power output, anaerobic capacity.",
        stimulusNote: "Max effort during 20s work intervals. The 10s rest is sacred — use every second.",
    },
    DEATH_BY: {
        energySystem: "Glycolytic",
        primaryStimulus: "Threshold management, mental grit.",
        stimulusNote: "Start smooth. The early minutes should feel easy. The challenge is in the later rounds.",
    },
    "21_15_9": {
        energySystem: "Phosphagen-Glycolytic",
        primaryStimulus: "High-intensity sprint, maximal turnover.",
        stimulusNote: "This is a sprint. Unbroken sets early, fast transitions. Aim for sub-10 minutes.",
    },
    LADDER: {
        energySystem: "Mixed",
        primaryStimulus: "Volume accumulated under fatigue.",
        stimulusNote: "Focus on smooth transitions. The volume builds quickly. Pace yourself.",
    },
    CHIPPER: {
        energySystem: "Aerobic-Glycolytic",
        primaryStimulus: "Stamina and mental resilience.",
        stimulusNote: "A mental and physical test of stamina. Chip away at the large sets. Don't look at the whole list, just the movement in front of you.",
    },
    INTERVAL: {
        energySystem: "Aerobic / Power",
        primaryStimulus: "Repeatability and recovery.",
        stimulusNote: "Focus on consistent effort across intervals. Round times should be repeatable.",
    },
    STRENGTH_SINGLE: {
        energySystem: "Phosphagen (Neuromuscular)",
        primaryStimulus: "Absolute strength development.",
        stimulusNote: "Focus on mechanics and absolute strength. Take full recovery between attempts.",
    },
    STRENGTH_SETS: {
        energySystem: "Phosphagen / Neuromuscular",
        primaryStimulus: "Positional strength and volume load.",
        stimulusNote: "Move the load with perfect form. Rest until you are fully ready for the next set.",
    },
    REST_DAY: {
        energySystem: "Recovery",
        primaryStimulus: "Homeostasis and adaptation.",
        stimulusNote: "Recovery is where the adaptation happens. Eat well and stay mobile.",
    },
};

export class WodAssemblyService {
    /**
     * Entry point: Assembles a workout based on category and available movements.
     */
    assemble(
        movements: FilteredMovement[],
        category: WodCategory,
        presetName?: string
    ): GeneratedWorkout {
        // 1. Pick Protocol and Duration (Evolve-Friendly Dispatcher)
        const { protocol, duration, ladderType, scoringType } = this.selectProtocolAndDuration(category);

        const config = TEMPLATES[protocol];

        // 2. Select Movements (Intelligent Pairing Filter)
        const selected: FilteredMovement[] = [];
        const count = Math.min(
            movements.length,
            Math.floor(Math.random() * (config.movementCount.max - config.movementCount.min + 1)) +
            config.movementCount.min
        );

        let candidates = [...movements];
        for (let i = 0; i < count; i++) {
            if (candidates.length === 0) break;

            // Pick a movement
            const idx = Math.floor(Math.random() * candidates.length);
            const picked = candidates[idx];
            selected.push(picked);

            // Filter out conflicting families for the next pick
            candidates = this.filterConflictingMovements(candidates, selected);
        }

        // 3. Pick Rep Scheme
        const repScheme = config.repSchemes[Math.floor(Math.random() * config.repSchemes.length)];

        // 4. Build movement items
        const movementItems = selected.map((fm, i) => {
            const isMaxReps = repScheme === "MAX_REPS";
            // For Strength/Ladders, reps are defined differently, but we store base reps or 0
            const reps = isMaxReps ? 0 : (repScheme as number[])[i] ?? (repScheme as number[])[0];

            const item: {
                reps: number;
                isMaxReps: boolean;
                name: string;
                weight?: string;
                distance?: string;
            } = {
                reps,
                isMaxReps,
                name: fm.resolvedName,
            };

            if (fm.defaultLoadKg) {
                item.weight = `${fm.defaultLoadKg}kg`;
            }

            return item;
        });

        const movementStrings = movementItems.map((item) => {
            const qtyLabel = item.isMaxReps ? "Max Reps" : item.reps.toString();
            // Special string for Strength sets since they have fixed schemas like 5x5
            if (protocol === "STRENGTH_SETS") {
                const setLabel = repScheme[0] === 5 ? "5 sets of 5" : "3 sets of 3";
                return `${setLabel} ${item.name} (${item.weight || "Heavy"})`;
            }

            let s = `${qtyLabel} ${item.name}`;
            if (item.weight) s += ` (${item.weight})`;
            if (item.distance) s += ` ${item.distance}`;
            return s;
        });

        const wod: AssembledWod = {
            type: protocol,
            protocol,
            category,
            duration,
            description: config.description(duration, movementStrings, ladderType, scoringType),
            movements: selected.map((fm) => fm.movement.name),
            movementItems,
            ladderType,
            scoringType
        };

        const meta = STIMULUS_METADATA[protocol];
        const movementEmphasis = Array.from(new Set(selected.map((fm) => fm.movement.modality)));
        const timeDomain = category === "sprint" ? "< 7m" : category === "metcon" ? "7-20m" : "20m+";
        const equipmentUsed = Array.from(new Set(selected.flatMap((fm) => fm.movement.equipmentRequired)));

        return {
            wod,
            warmup: ["5 min Light Cardio", "Dynamic Mobility", "Movement Prep"],
            scalingOptions: ["Reduce Load", "Modify Complexity", "Scale Volume"],
            intensityGuidance: "Aim for consistent movememt and high relative intensity.",
            intendedStimulus: `${timeDomain} — ${movementEmphasis.map(m => m === 'G' ? 'Gymnastics' : m === 'W' ? 'Weightlifting' : 'Monostructural').join(" + ")}`,
            energySystem: meta.energySystem,
            primaryStimulus: meta.primaryStimulus,
            timeDomain,
            movementEmphasis,
            stimulusNote: meta.stimulusNote,
            equipmentPresetName: presetName,
            equipmentUsed,
        };
    }

    /**
     * Evolve-friendly Dispatcher: Picks protocol and duration limits based on category.
     * Isolate this so future AI/Data systems can replace it easily.
     */
    private selectProtocolAndDuration(category: WodCategory): {
        protocol: WodProtocol;
        duration: number;
        ladderType?: "ascending" | "descending" | "pyramid";
        scoringType?: "AMRAP" | "FOR_TIME";
    } {
        if (category === "sprint") {
            const protocols: Array<{ p: WodProtocol; w: number }> = [
                { p: "21_15_9", w: 25 },
                { p: "TABATA", w: 25 },
                { p: "FOR_TIME", w: 20 },
                { p: "STRENGTH_SINGLE", w: 15 },
                { p: "LADDER", w: 15 },
            ];
            const p = this.weightedPick(protocols);
            const duration = p === "TABATA" ? 4 : p === "STRENGTH_SINGLE" ? 7 : 7; // Fixed or 7m cap
            return {
                protocol: p,
                duration,
                ladderType: p === "LADDER" ? "ascending" : undefined,
                scoringType: p === "LADDER" ? "AMRAP" : "FOR_TIME"
            };
        }

        if (category === "metcon") {
            const protocols: Array<{ p: WodProtocol; w: number }> = [
                { p: "AMRAP", w: 24 },
                { p: "EMOM", w: 28 },
                { p: "FOR_TIME", w: 28 },
                { p: "DEATH_BY", w: 10 },
                { p: "LADDER", w: 10 },
            ];
            const p = this.weightedPick(protocols);
            const duration = [8, 10, 12, 15, 18, 20][Math.floor(Math.random() * 6)];
            return {
                protocol: p,
                duration,
                ladderType: p === "LADDER" ? "ascending" : undefined,
                scoringType: p === "LADDER" ? "AMRAP" : p === "FOR_TIME" ? "FOR_TIME" : "AMRAP"
            };
        }

        // Long / Aerobic
        const protocols: Array<{ p: WodProtocol; w: number }> = [
            { p: "CHIPPER", w: 30 },
            { p: "AMRAP", w: 20 },
            { p: "INTERVAL", w: 20 },
            { p: "STRENGTH_SETS", w: 15 },
            { p: "LADDER", w: 15 },
        ];
        const p = this.weightedPick(protocols);
        const duration = [25, 30, 40][Math.floor(Math.random() * 3)];
        return {
            protocol: p,
            duration,
            ladderType: p === "LADDER" ? (Math.random() > 0.5 ? "pyramid" : "descending") : undefined,
            scoringType: p === "LADDER" ? "FOR_TIME" : p === "CHIPPER" ? "FOR_TIME" : "AMRAP"
        };
    }

    private weightedPick<T>(options: Array<{ p: T; w: number }>): T {
        const total = options.reduce((sum, o) => sum + o.w, 0);
        let rand = Math.random() * total;
        for (const o of options) {
            if (rand < o.w) return o.p;
            rand -= o.w;
        }
        return options[0].p;
    }

    /**
     * Intelligent Movement Pairing: Avoids duplicate joint/pattern overload.
     */
    private filterConflictingMovements(
        candidates: FilteredMovement[],
        selected: FilteredMovement[]
    ): FilteredMovement[] {
        const usedFamilies = new Set(
            selected.map((fm) => (fm.movement as any).family).filter((f) => !!f)
        );
        return candidates.filter((m) => {
            const family = (m.movement as any).family;
            return !family || !usedFamilies.has(family);
        });
    }
}

// Singleton export
export const wodAssemblyService = new WodAssemblyService();
