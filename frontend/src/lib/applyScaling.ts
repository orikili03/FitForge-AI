import type { WorkoutSpec, MovementItemSpec } from "../domains/workouts/api";

/**
 * Applies selected scaling options to a WOD without breaking aim, efficiency, or methodology.
 * - At most one load reduction is applied (strongest selected), so multiple "reduce load" options don't stack.
 * - At most one substitution per movement type, so e.g. "Ring rows" and "Banded pull-ups" don't conflict (last wins).
 * - Substitutions and load reduction combine safely: scale load + substitute movements = one coherent scaled WOD.
 */

/** Infer a movement key from display/abbrev name for substitution matching. */
function movementKeyFromName(name: string): string {
    const u = (name || "").trim().toUpperCase();
    if (u.includes("PULL") && !u.includes("PUSH")) return "pull-up";
    if (u === "BP" || u.includes("BURPEE")) return "burpee";
    if (u.includes("PUSH")) return "push-up";
    if (u.includes("DL") || u.includes("DEADLIFT")) return "deadlift";
    if (u.includes("FS") || u.includes("FRONT SQUAT")) return "front squat";
    if (u.includes("BS") || u.includes("BACK SQUAT")) return "back squat";
    if (u.includes("PP") || u.includes("PUSH PRESS")) return "push press";
    if (u.includes("PC") || u.includes("POWER CLEAN")) return "power clean";
    if (u.includes("ROW")) return "row";
    if (u.includes("AB") || u.includes("ASSAULT") || u.includes("BIKE")) return "assault bike";
    if (u.includes("RUN")) return "run";
    if (u.includes("DU") || u.includes("DOUBLE-UNDER")) return "double-under";
    if (u.includes("AS") || u.includes("AIR SQUAT")) return "air squat";
    return "";
}

type ScalingRule =
    | { type: "load"; multiplier: number }
    | { type: "reps"; multiplier: number }
    | { type: "repsOverride"; movementKey: string; reps: number }
    | { type: "distance"; multiplier?: number; setMeters?: number }
    | { type: "substitute"; movementKey: string; displayName: string };

/** Match option label to a scaling rule. Labels are from backend scalingRules / agent. */
function getRuleForOption(option: string): ScalingRule | null {
    const o = option.trim().toLowerCase();
    // Per-movement reps override: "Reduce push-up reps to 7" (match before generic "reduce reps")
    const repsToMatch = o.match(/reps\s+to\s+(\d+)/);
    if (repsToMatch) {
        const reps = Math.max(1, parseInt(repsToMatch[1], 10));
        if (o.includes("push-up")) return { type: "repsOverride", movementKey: "push-up", reps };
        if (o.includes("pull-up")) return { type: "repsOverride", movementKey: "pull-up", reps };
        if (o.includes("burpee")) return { type: "repsOverride", movementKey: "burpee", reps };
        if (o.includes("air squat") || o.includes("squat")) return { type: "repsOverride", movementKey: "air squat", reps };
    }
    // Reps: e.g. "Reduce reps by 30%", "Reduce reps 30%", "reduce reps by 30"
    if (o.includes("reduce reps") && !o.includes("loading")) {
        const match = o.match(/reduce\s+reps\s+(?:by\s+)?(\d+)\s*%?/);
        if (match) {
            const pct = parseInt(match[1], 10);
            return { type: "reps", multiplier: Math.max(0.1, 1 - pct / 100) };
        }
        return { type: "reps", multiplier: 0.7 };
    }
    // Load: apply at most one; we take the strongest reduction when multiple selected
    if (o.includes("reduce load") || o.includes("reduce loading")) {
        const match = o.match(/(\d+)\s*-\s*(\d+)\s*%/) ?? o.match(/(\d+)\s*%/);
        if (match) {
            const pct = match[2] != null ? (parseInt(match[1], 10) + parseInt(match[2], 10)) / 2 : parseInt(match[1], 10);
            return { type: "load", multiplier: 1 - pct / 100 };
        }
        return { type: "load", multiplier: 0.65 };
    }
    // Pull-up substitutions (one per movement key)
    if (o.includes("ring row")) return { type: "substitute", movementKey: "pull-up", displayName: "Ring Row" };
    if (o.includes("banded pull-up")) return { type: "substitute", movementKey: "pull-up", displayName: "Banded Pull-Up" };
    if (o.includes("jumping pull-up")) return { type: "substitute", movementKey: "pull-up", displayName: "Jumping Pull-Up" };
    // Push-up (match "elevate" before generic reps so "reduce push-up reps or elevate hands" → substitute)
    if (o.includes("push-up") && o.includes("elevate")) return { type: "substitute", movementKey: "push-up", displayName: "Elevated Push-Up" };
    if (o.includes("elevated push-up") || o.includes("hands on box")) return { type: "substitute", movementKey: "push-up", displayName: "Elevated Push-Up" };
    if (o.includes("knee push-up")) return { type: "substitute", movementKey: "push-up", displayName: "Knee Push-Up" };
    if (o.includes("wall push-up")) return { type: "substitute", movementKey: "push-up", displayName: "Wall Push-Up" };
    // Squat
    if (o.includes("reduce depth") || o.includes("box squat")) return { type: "substitute", movementKey: "air squat", displayName: "Box Squat" };
    if (o.includes("assisted squat")) return { type: "substitute", movementKey: "air squat", displayName: "Assisted Squat" };
    if (o.includes("goblet squat")) return { type: "substitute", movementKey: "front squat", displayName: "Goblet Squat" };
    // Burpee
    if ((o.includes("replace") && o.includes("burpee") && o.includes("air squat")) || (o.includes("burpee") && o.includes("air squat"))) {
        return { type: "substitute", movementKey: "burpee", displayName: "Air Squat" };
    }
    if (o.includes("step-back burpee")) return { type: "substitute", movementKey: "burpee", displayName: "Step-Back Burpee" };
    if (o.includes("no push-up burpee")) return { type: "substitute", movementKey: "burpee", displayName: "No Push-Up Burpee" };
    if (o.includes("box step-over")) return { type: "substitute", movementKey: "burpee", displayName: "Box Step-Over" };
    // Strength
    if (o.includes("kettlebell") && o.includes("deadlift")) return { type: "substitute", movementKey: "deadlift", displayName: "Kettlebell Deadlift" };
    if (o.includes("dumbbell deadlift")) return { type: "substitute", movementKey: "deadlift", displayName: "Dumbbell Deadlift" };
    if (o.includes("sumo deadlift")) return { type: "substitute", movementKey: "deadlift", displayName: "Sumo Deadlift" };
    // "Replace BB DL with AS" / "Replace barbell deadlift with air squat" (AI-generated or custom)
    if (o.includes("replace") && o.includes("dl") && o.includes("with") && (o.includes(" as") || o.endsWith(" as")))
        return { type: "substitute", movementKey: "deadlift", displayName: "Air Squat" };
    if (o.includes("strict press")) return { type: "substitute", movementKey: "push press", displayName: "Strict Press" };
    if (o.includes("dumbbell press")) return { type: "substitute", movementKey: "push press", displayName: "Dumbbell Press" };
    if (o.includes("hang power clean")) return { type: "substitute", movementKey: "power clean", displayName: "Hang Power Clean" };
    if (o.includes("dumbbell clean")) return { type: "substitute", movementKey: "power clean", displayName: "Dumbbell Clean" };
    // Mono
    if (o.includes("single-under")) return { type: "substitute", movementKey: "double-under", displayName: "Single-Under" };
    if (o.includes("bike") && o.includes("substitute")) return { type: "substitute", movementKey: "run", displayName: "Bike" };
    if (o.includes("row substitute") || o.includes("row or run")) return { type: "substitute", movementKey: "run", displayName: "Row" };
    // Fixed distance: "Reduce run distance to 200m" → set run/row to 200m (match before percentage)
    const toMeters = o.match(/to\s+(\d+)\s*m/i) ?? o.match(/distance\s+to\s+(\d+)\s*m/i);
    if ((o.includes("reduce") && o.includes("distance")) && toMeters) {
        return { type: "distance", setMeters: parseInt(toMeters[1], 10) };
    }
    // "Reduce run distance" / "Reduce distance" / "Shorten distance" (no "to Xm"): scale by 50% or by N%
    if (o.includes("reduce distance") || o.includes("shorten distance") || o.includes("reduce run distance")) {
        const match = o.match(/(?:by\s+)?(\d+)\s*%?/);
        const pct = match ? parseInt(match[1], 10) : 50;
        return { type: "distance", multiplier: Math.max(0.1, 1 - pct / 100) };
    }
    if (o.includes("walk") || o.includes("jog")) return { type: "substitute", movementKey: "run", displayName: "Walk/Jog" };
    return null;
}

function parseWeight(s: string): number | null {
    if (!s || typeof s !== "string") return null;
    const m = s.trim().match(/^(\d*\.?\d+)\s*(kg|lb|#)?$/i);
    if (!m) return null;
    return parseFloat(m[1]);
}

function formatWeight(value: number, original: string): string {
    const u = (original || "").trim();
    if (u.endsWith("lb") || u.endsWith("#")) return `${Math.round(value)} lb`;
    return `${Math.round(value)}kg`;
}

/** Parse distance string (e.g. "400m", "1 mile", "500m") to numeric value and unit. */
function parseDistance(s: string): { value: number; unit: string } | null {
    if (!s || typeof s !== "string") return null;
    const t = s.trim();
    const m = t.match(/^(\d*\.?\d+)\s*(m|meter|meters|mile|miles|km|yd|yards?)?$/i);
    if (!m) return null;
    const value = parseFloat(m[1]);
    let unit = (m[2] ?? "m").toLowerCase();
    if (unit === "meters") unit = "m";
    if (unit === "yards") unit = "yd";
    return { value, unit };
}

/** Parse leading distance from movement name (e.g. "400m Run" -> { value, unit, restName: "Run" }). */
function parseLeadingDistance(name: string): { value: number; unit: string; restName: string } | null {
    if (!name || typeof name !== "string") return null;
    const t = name.trim();
    const m = t.match(/^(\d*\.?\d+)\s*(m|meter|meters|mile|miles|km|yd|yards?)?\s+(.+)$/i);
    if (!m) return null;
    const value = parseFloat(m[1]);
    let unit = (m[2] ?? "m").toLowerCase();
    if (unit === "meters") unit = "m";
    if (unit === "yards") unit = "yd";
    return { value, unit, restName: m[3].trim() };
}

/** Parse movement string into reps + name or distance + name when building from movements[] only. */
function parseMovementString(s: string): { reps: number; name: string; distance?: string } {
    const t = (s || "").trim();
    const distMatch = t.match(/^(\d*\.?\d+)\s*(m|meter|meters|mile|miles|km|yd|yards?)?\s+(.+)$/i);
    if (distMatch) {
        let unit = (distMatch[2] ?? "m").toLowerCase();
        if (unit === "meters") unit = "m";
        if (unit === "yards") unit = "yd";
        const value = parseFloat(distMatch[1]);
        const distStr = unit === "mile" || unit === "miles" ? `${value} ${unit}` : `${Math.round(value)}${unit}`;
        return { reps: 10, name: distMatch[3].trim(), distance: distStr };
    }
    const repMatch = t.match(/^(\d+)\s+(.+)$/);
    if (repMatch) return { reps: parseInt(repMatch[1], 10), name: repMatch[2].trim() };
    return { reps: 10, name: t };
}

function formatDistance(value: number, unit: string): string {
    const v = Math.round(value);
    if (unit === "mile" || unit === "miles") return v === 1 ? "1 mile" : `${v} miles`;
    if (unit === "km") return `${v}km`;
    if (unit === "yd") return `${v} yd`;
    return `${v}m`;
}

/**
 * Returns a new WOD spec with scaling applied. Safe for multiple options:
 * one load factor (strongest reduction), one substitute per movement key.
 */
export function applyScaling(wod: WorkoutSpec["wod"], selectedOptionLabels: string[]): WorkoutSpec["wod"] {
    if (selectedOptionLabels.length === 0) return wod;

    const rules = selectedOptionLabels.map(getRuleForOption).filter((r): r is ScalingRule => r != null);
    const loadRules = rules.filter((r): r is { type: "load"; multiplier: number } => r.type === "load");
    const loadMultiplier = loadRules.length > 0
        ? Math.min(...loadRules.map((r) => r.multiplier))
        : 1;
    const repRules = rules.filter((r): r is { type: "reps"; multiplier: number } => r.type === "reps");
    const repMultiplier = repRules.length > 0
        ? Math.min(...repRules.map((r) => r.multiplier))
        : 1;
    const repsOverrideByKey = new Map<string, number>();
    for (const r of rules) {
        if (r.type === "repsOverride") repsOverrideByKey.set(r.movementKey, r.reps);
    }
    const distanceRules = rules.filter((r): r is { type: "distance"; multiplier?: number; setMeters?: number } => r.type === "distance");
    const fixedDistanceM = distanceRules.find((r) => r.setMeters != null)?.setMeters;
    const multiplierValues = distanceRules.map((r) => r.multiplier).filter((m): m is number => m != null && m < 1);
    const distanceMultiplier = fixedDistanceM == null && multiplierValues.length > 0 ? Math.min(...multiplierValues) : 1;
    const useFixedDistance = fixedDistanceM != null;
    // One substitution per movement key: last rule wins for that key
    const substituteByKey = new Map<string, string>();
    for (const r of rules) {
        if (r.type === "substitute") substituteByKey.set(r.movementKey, r.displayName);
    }

    const movementItems = wod.movementItems ?? wod.movements.map((raw) => {
        const { reps, name, distance } = parseMovementString(raw);
        return { reps, name, weight: undefined as string | undefined, distance };
    });

    const newItems: MovementItemSpec[] = movementItems.map((item) => {
        const key = movementKeyFromName(item.name);
        const substitute = key ? substituteByKey.get(key) : undefined;
        const name = substitute ?? item.name;
        let weight = item.weight;
        if (loadMultiplier < 1 && item.weight) {
            const num = parseWeight(item.weight);
            if (num != null) weight = formatWeight(num * loadMultiplier, item.weight);
        }
        const overrideReps = key ? repsOverrideByKey.get(key) : undefined;
        const outReps = overrideReps != null
            ? overrideReps
            : repMultiplier < 1
                ? Math.max(1, Math.round(item.reps * repMultiplier))
                : item.reps;
        let distance = item.distance;
        let finalName = name;
        const isRunOrRow = key === "run" || key === "row";
        const isDistanceOnlyName = /^\d+\s*m$/i.test((item.name || "").trim());
        if (useFixedDistance && fixedDistanceM != null && (isRunOrRow || isDistanceOnlyName)) {
            distance = `${fixedDistanceM}m`;
            const fromName = parseLeadingDistance(item.name);
            if (fromName) finalName = fromName.restName;
            else if (isDistanceOnlyName) finalName = "Run";
        } else if (distanceMultiplier < 1) {
            if (item.distance) {
                const parsed = parseDistance(item.distance);
                if (parsed) {
                    const scaled = Math.max(1, Math.round(parsed.value * distanceMultiplier));
                    distance = formatDistance(scaled, parsed.unit);
                }
            } else if (isRunOrRow || isDistanceOnlyName) {
                const fromName = parseLeadingDistance(item.name);
                const defaultM = key === "row" ? 500 : 400;
                if (fromName) {
                    const scaled = Math.max(1, Math.round(fromName.value * distanceMultiplier));
                    distance = formatDistance(scaled, fromName.unit);
                    finalName = fromName.restName;
                } else {
                    const scaled = Math.max(1, Math.round(defaultM * distanceMultiplier));
                    distance = `${scaled}m`;
                    if (isDistanceOnlyName) finalName = "Run";
                }
            }
        }
        return { reps: outReps, name: finalName, weight, distance };
    });

    const newMovements = newItems.map((i) => i.name);

    return {
        ...wod,
        movements: newMovements,
        movementItems: newItems,
    };
}
