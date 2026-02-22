/**
 * Applies selected scaling options to a WOD without breaking aim, efficiency, or methodology.
 * - At most one load reduction is applied (strongest selected), so multiple "reduce load" options don't stack.
 * - At most one substitution per movement type, so e.g. "Ring rows" and "Banded pull-ups" don't conflict (last wins).
 * - Substitutions and load reduction combine safely: scale load + substitute movements = one coherent scaled WOD.
 */

export interface MovementItemSpec {
  reps: number;
  name: string;
  weight?: string;
  distance?: string;
}

export interface WodSpec {
  type: string;
  duration?: number;
  description: string;
  movements: string[];
  rounds?: number;
  movementItems?: MovementItemSpec[];
}

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
  | { type: "distance"; multiplier: number }
  | { type: "substitute"; movementKey: string; displayName: string };

/** Match option label to a scaling rule. Labels are from backend scalingRules / agent. */
function getRuleForOption(option: string): ScalingRule | null {
  const o = option.trim().toLowerCase();
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
  // Push-up
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
  // Shorten/reduce distance: scale the distance value (e.g. 400m → 200m), not a name substitute
  if (o.includes("reduce distance") || o.includes("shorten distance")) {
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
export function applyScaling(wod: WodSpec, selectedOptionLabels: string[]): WodSpec {
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
  const distanceRules = rules.filter((r): r is { type: "distance"; multiplier: number } => r.type === "distance");
  const distanceMultiplier = distanceRules.length > 0
    ? Math.min(...distanceRules.map((r) => r.multiplier))
    : 1;
  // One substitution per movement key: last rule wins for that key
  const substituteByKey = new Map<string, string>();
  for (const r of rules) {
    if (r.type === "substitute") substituteByKey.set(r.movementKey, r.displayName);
  }

  const movementItems = wod.movementItems ?? wod.movements.map((name, i) => ({
    reps: 10,
    name,
    weight: undefined as string | undefined,
    distance: undefined as string | undefined,
  }));

  const newItems: MovementItemSpec[] = movementItems.map((item) => {
    const key = movementKeyFromName(item.name);
    const substitute = key ? substituteByKey.get(key) : undefined;
    let name = substitute ?? item.name;
    let weight = item.weight;
    if (loadMultiplier < 1 && item.weight) {
      const num = parseWeight(item.weight);
      if (num != null) weight = formatWeight(num * loadMultiplier, item.weight);
    }
    const outReps = repMultiplier < 1
      ? Math.max(1, Math.round(item.reps * repMultiplier))
      : item.reps;
    let distance = item.distance;
    if (distanceMultiplier < 1 && item.distance) {
      const parsed = parseDistance(item.distance);
      if (parsed) {
        const scaled = Math.max(1, Math.round(parsed.value * distanceMultiplier));
        distance = formatDistance(scaled, parsed.unit);
      }
    }
    return { reps: outReps, name, weight, distance };
  });

  const newMovements = newItems.map((i) => i.name);

  return {
    ...wod,
    movements: newMovements,
    movementItems: newItems,
  };
}
