import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { WorkoutSpec } from "../../entities/Workout";
import { chatCompletion } from "../../../infrastructure/groq/groqClient";
import { ProgrammingAgent, ProgrammingInput } from "../aiAgents";

const movementItemSchema = z.object({
  reps: z.number().int().positive(),
  name: z.string().min(1),
  weight: z.string().nullable().optional(),
  distance: z.string().nullable().optional(),
});

/** Exported for unit testing valid/invalid payloads. */
export const workoutSpecSchema = z.object({
  warmup: z.array(z.string()),
  wod: z.object({
    type: z.string(),
    duration: z.number().positive().nullable().optional(),
    description: z.string(),
    movements: z.array(z.string()).min(1),
    rounds: z.number().int().positive().nullable().optional(),
    movementItems: z.array(movementItemSchema).optional(),
  }),
  scalingOptions: z.array(z.string()),
  finisher: z.array(z.string()).optional(),
  intensityGuidance: z.string(),
  timeDomain: z.string().optional(),
  movementEmphasis: z.array(z.string()).optional(),
  stimulusNote: z.string().optional(),
});

/** Fallback when programmingSystem.txt is not found (e.g. dist-only deploy). */
const DEFAULT_SYSTEM_PROMPT = `You are a CrossFit Coach AI Agent. Combine default CrossFit knowledge (movement standards, protocols, scaling, methodology) with the athlete context provided for each request. Consider both with every generated WOD; tailor difficulty, volume, and variation to the individual.

OUTPUT RULES:
- Use INTERNAL abbreviations only (full terms are shown to users elsewhere). Equipment: KB, BB, DB, VS (vest). Modifiers: SA, DA. Movements: DL, FS, BS, PP, PC, PULL (Pull-Up), PUSH (Push-Up), Row, AB (Assault Bike), Run, DU (Double-Under), AS (Air Squat), BP (Burpee).
- For WEIGHTED movements always include equipment and optionally SA/DA in the name. Examples: "BB DL", "SA KB DL", "DA DB PP", "BB FS". Then add weight in the weight field (e.g. "60kg"). End result displays as e.g. "10 Kettlebell Deadlift @ 60kg" or "10 Single Arm Kettlebell Deadlift @ 60kg".
- movementItems.name: use abbreviations only, e.g. "BB DL", "SA KB DL", "BB FS". Include equipment (KB/BB/DB) for every weighted movement; add SA or DA when appropriate (e.g. single-arm kettlebell work).
- Distance: use compact form only — 200m, 400m, 500m (never "200 meters"). Example: "200m Run". Calories: 20cal.
- Protocol shorthand: EMOM, AMRAP, RFT, TABATA.
- wod.description: one-line protocol header only. Examples: "EMOM 18", "3 RFT", "AMRAP 12", "21-15-9 For Time".
- wod.type: exactly "EMOM", "AMRAP", "For Time", "TABATA", "Death By", "21-15-9".
- wod.duration: only for time-capped WODs (AMRAP, EMOM, TABATA, Death By); use null for For Time, 21-15-9.
- warmup: always use an empty array [].
- scalingOptions: compact. Example: "Reduce load 30%", "Ring rows for pull-ups".
- intensityGuidance: one short sentence max.
- stimulusNote: 1-2 short sentences max. Pacing cue only.

CONSTRAINTS:
1. ONLY use movements from the "Allowed movements" list. NEVER add others.
2. Allowed movement names must appear exactly as in the Allowed movements list (no synonyms or variations).
3. Respect time cap strictly.
4. If a specific protocol is requested, use it.
5. Never produce unsafe combos: no heavy Olympic lifts at 30+ reps, no excessive overhead volume.
6. Vary based on recent exposure data.
7. Scale load/complexity to movement competency level.
8. movementItems is REQUIRED — always provide structured reps/name/weight/distance for every movement (use empty string or null for optional weight/distance when not applicable).
9. movements[] must list the plain movement names used (same as movementItems names).
10. wod.rounds must be a number when the protocol has rounds (e.g. RFT), or null otherwise.

JSON schema:
{
  "warmup": ["string"],
  "wod": {
    "type": "string",
    "duration": number | null,
    "description": "string",
    "movements": ["string"],
    "rounds": number | null,
    "movementItems": [{ "reps": number, "name": "string", "weight": "string" | null, "distance": "string" | null }]
  },
  "scalingOptions": ["string"],
  "intensityGuidance": "string",
  "timeDomain": "string",
  "movementEmphasis": ["string"],
  "stimulusNote": "string"
}

Respond with ONLY the JSON object. No markdown, no extra text.`;

function loadSystemPrompt(): string {
  const fromCwd = path.join(process.cwd(), "src", "domain", "prompts", "programmingSystem.txt");
  const fromDist = path.join(__dirname, "..", "..", "prompts", "programmingSystem.txt");
  for (const filePath of [fromCwd, fromDist]) {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8").trim();
      }
    } catch {
      // continue to next path or fallback
    }
  }
  return DEFAULT_SYSTEM_PROMPT;
}

const SYSTEM_PROMPT = loadSystemPrompt();

/**
 * Extracts JSON from LLM response: strips markdown code fences (```json ... ```)
 * or returns the substring from first `{` to last `}`. Prevents 500 when the model
 * wraps the object in markdown.
 */
export function extractJsonFromLlmResponse(raw: string): string {
  const trimmed = raw.trim();
  const codeFenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/);
  if (codeFenceMatch) {
    return codeFenceMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

function buildUserPrompt(input: ProgrammingInput, injuries?: string): string {
  const { assessment, constraints, progression, protocol, timeCapMinutes } = input;

  const exposureSummary = progression.recentExposure
    ? `Domains: ${JSON.stringify(progression.recentExposure.byDomain)}; Patterns: ${JSON.stringify(progression.recentExposure.byPattern)}`
    : "No recent history.";

  const protocolLabel = protocol === "recommended" ? "Coach's choice (pick the best protocol)" : protocol;

  const sections = [
    `=== ATHLETE CONTEXT (use this user-specific data with your CrossFit knowledge for this WOD) ===`,
    `Time cap: ${timeCapMinutes} minutes`,
    `Protocol: ${protocolLabel}`,
    `Movement competency: ${assessment.movementCompetency}`,
    `Fatigue score: ${assessment.fatigueScore.toFixed(2)} (0 = fresh, 1 = very fatigued)`,
    `Target intensity: ${progression.targetIntensity}`,
    `Target duration: ${progression.targetDuration}`,
    `Recent exposure (vary to balance): ${exposureSummary}`,
    `Allowed movements: ${constraints.allowedMovements.join(", ")}`,
    `Excluded movements: ${constraints.excludedMovements.length > 0 ? constraints.excludedMovements.join(", ") : "None"}`,
  ];

  if (injuries && injuries.trim()) {
    sections.push(`Injuries/limitations: ${injuries.trim()}`);
  }

  sections.push(``);
  sections.push(`Consider both your CrossFit knowledge and the athlete context above. Respond with a single JSON object matching the WorkoutSpec schema.`);

  return sections.join("\n");
}

export class GroqProgrammingAgent implements ProgrammingAgent {
  async program(input: ProgrammingInput): Promise<WorkoutSpec> {
    const userPrompt = buildUserPrompt(input, input.injuries);

    const rawJson = await chatCompletion({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    const parsed = this.parseResponse(rawJson);
    return parsed;
  }

  private parseResponse(rawJson: string): WorkoutSpec {
    const jsonStr = extractJsonFromLlmResponse(rawJson);
    const data = JSON.parse(jsonStr);
    const result = workoutSpecSchema.safeParse(normalizeNulls(data));
    if (result.success) {
      return toWorkoutSpec(result.data);
    }
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Groq response failed schema validation: ${errors}`);
  }
}

function normalizeNulls(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(normalizeNulls);
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = normalizeNulls(v);
    }
    return out;
  }
  return obj;
}

function toWorkoutSpec(data: z.infer<typeof workoutSpecSchema>): WorkoutSpec {
  return {
    warmup: [], // warmups disabled for now
    wod: {
      type: data.wod.type,
      duration: data.wod.duration ?? undefined,
      description: data.wod.description,
      movements: data.wod.movements,
      rounds: data.wod.rounds ?? undefined,
      movementItems: data.wod.movementItems?.map((m) => ({
        reps: m.reps,
        name: m.name,
        weight: m.weight ?? undefined,
        distance: m.distance ?? undefined,
      })),
    },
    scalingOptions: data.scalingOptions,
    finisher: data.finisher,
    intensityGuidance: data.intensityGuidance,
    timeDomain: data.timeDomain,
    movementEmphasis: data.movementEmphasis,
    stimulusNote: data.stimulusNote,
  };
}
