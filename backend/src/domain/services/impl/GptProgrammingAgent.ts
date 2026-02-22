import { z } from "zod";
import { WorkoutSpec } from "../../entities/Workout";
import { chatCompletion } from "../../../infrastructure/groq/groqClient";
import { retrieveContext } from "../ragService";
import { ProgrammingAgent, ProgrammingInput } from "../aiAgents";

const movementItemSchema = z.object({
  reps: z.number().int().positive(),
  name: z.string().min(1),
  weight: z.string().optional(),
  distance: z.string().optional(),
});

const workoutSpecSchema = z.object({
  warmup: z.array(z.string()),
  wod: z.object({
    type: z.string(),
    duration: z.number().positive().nullable().optional(),
    description: z.string(),
    movements: z.array(z.string()).min(1),
    rounds: z.number().int().positive().optional(),
    movementItems: z.array(movementItemSchema).optional(),
  }),
  scalingOptions: z.array(z.string()),
  finisher: z.array(z.string()).optional(),
  intensityGuidance: z.string(),
  timeDomain: z.string().optional(),
  movementEmphasis: z.array(z.string()).optional(),
  stimulusNote: z.string().optional(),
});

const SYSTEM_PROMPT = `You are an elite CrossFit coach. You program workouts using authentic CrossFit methodology: functional movements, constantly varied, intensity-driven, balanced patterns, safe volume.

OUTPUT RULES:
- Compact notation only. No sentences, no explanations in movement names.
- Each movement: reps + short name + load/distance. Example: "6 BB Reverse Lunges @ 20kg"
- Use abbreviations: BB (barbell), DB (dumbbell), KB (kettlebell), cal (calories). Distance: always 200m, 400m, 500m (never "200 meters"). Example: "200m Run" not "200 meters Run".
- Protocol shorthand: EMOM, AMRAP, RFT (rounds for time), E2MOM, TABATA.
- wod.description: one-line protocol header only. Examples: "EMOM 18", "3 RFT", "AMRAP 12", "21-15-9 For Time".
- wod.type: the protocol keyword exactly: "EMOM", "AMRAP", "For Time", "TABATA", "Death By", "21-15-9".
- warmup: 2-4 short items. Example: "2 min row", "10 empty-bar front squats", "shoulder dislocates x10".
- scalingOptions: compact. Example: "Reduce load 30%", "Ring rows for pull-ups", "Step-ups for box jumps".
- intensityGuidance: one short sentence max.
- stimulusNote: 1-2 short sentences max. Pacing cue only.
- wod.duration: only for time-capped WODs (AMRAP, EMOM, TABATA, Death By); use null for For Time, 21-15-9.

CONSTRAINTS:
1. ONLY use movements from the "Allowed movements" list. NEVER add others.
2. Respect time cap strictly.
3. If a specific protocol is requested, use it.
4. Never produce unsafe combos: no heavy Olympic lifts at 30+ reps, no excessive overhead volume.
5. Vary based on recent exposure data.
6. Scale load/complexity to movement competency level.
7. movementItems is REQUIRED — always provide structured reps/name/weight for every movement.
8. movements[] must list the plain movement names used (same as movementItems names).

JSON schema:
{
  "warmup": ["string"],
  "wod": {
    "type": "string",
    "duration": number | null,
    "description": "string",
    "movements": ["string"],
    "rounds": number | null,
    "movementItems": [{ "reps": number, "name": "string", "weight": "string?", "distance": "string?" }]
  },
  "scalingOptions": ["string"],
  "intensityGuidance": "string",
  "timeDomain": "string",
  "movementEmphasis": ["string"],
  "stimulusNote": "string"
}

Respond with ONLY the JSON object. No markdown, no extra text.`;

function buildUserPrompt(input: ProgrammingInput, ragContext: string[], injuries?: string): string {
  const { assessment, constraints, progression, primaryGoal, protocol, timeCapMinutes } = input;

  const exposureSummary = progression.recentExposure
    ? `Domains: ${JSON.stringify(progression.recentExposure.byDomain)}; Patterns: ${JSON.stringify(progression.recentExposure.byPattern)}`
    : "No recent history.";

  const protocolLabel = protocol === "recommended" ? "Coach's choice (pick the best protocol)" : protocol;

  const sections = [
    `=== ATHLETE CONTEXT ===`,
    `Goal: ${primaryGoal}`,
    `Time cap: ${timeCapMinutes} minutes`,
    `Protocol: ${protocolLabel}`,
    `Movement competency: ${assessment.movementCompetency}`,
    `Fatigue score: ${assessment.fatigueScore.toFixed(2)} (0 = fresh, 1 = very fatigued)`,
    `Target intensity: ${progression.targetIntensity}`,
    `Target duration: ${progression.targetDuration}`,
    `Recent exposure: ${exposureSummary}`,
    `Allowed movements: ${constraints.allowedMovements.join(", ")}`,
    `Excluded movements: ${constraints.excludedMovements.length > 0 ? constraints.excludedMovements.join(", ") : "None"}`,
  ];

  if (injuries && injuries.trim()) {
    sections.push(`Injuries/limitations: ${injuries.trim()}`);
  }

  if (ragContext.length > 0) {
    sections.push(``);
    sections.push(`=== CROSSFIT KNOWLEDGE (use for guidance) ===`);
    for (const chunk of ragContext) {
      sections.push(chunk);
      sections.push(`---`);
    }
  }

  sections.push(``);
  sections.push(`Respond with a single JSON object matching the WorkoutSpec schema described in your instructions.`);

  return sections.join("\n");
}

function buildRagQuery(input: ProgrammingInput): string {
  const parts = [
    `CrossFit ${input.primaryGoal} workout`,
    `${input.timeCapMinutes} minute time domain`,
  ];
  if (input.protocol !== "recommended") {
    parts.push(`${input.protocol} protocol`);
  }
  if (input.assessment.movementCompetency === "low") {
    parts.push("beginner scaling");
  }
  if (input.assessment.fatigueScore > 0.7) {
    parts.push("recovery day programming");
  }
  return parts.join(", ");
}

export class GptProgrammingAgent implements ProgrammingAgent {
  async program(input: ProgrammingInput): Promise<WorkoutSpec> {
    const ragQuery = buildRagQuery(input);
    const ragContext = await retrieveContext(ragQuery, 5);

    const userPrompt = buildUserPrompt(input, ragContext, input.injuries);

    const rawJson = await chatCompletion({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    const parsed = this.parseResponse(rawJson);
    return parsed;
  }

  private parseResponse(rawJson: string): WorkoutSpec {
    const data = JSON.parse(rawJson);
    const result = workoutSpecSchema.safeParse(data);
    if (result.success) {
      return result.data as WorkoutSpec;
    }
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`GPT response failed schema validation: ${errors}`);
  }
}
