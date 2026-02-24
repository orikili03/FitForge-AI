/**
 * RAG retrieval for WOD generation: rule-based selection of knowledge snippets
 * and historical WOD examples. No embeddings or vector DB — deterministic
 * filtering by protocol, time domain, and equipment overlap.
 *
 * Used by VertexProgrammingAgent to inject grounding context per request.
 */

import * as fs from "fs";
import * as path from "path";
import type { ProgrammingInput } from "../services/aiAgents";
import type { WODReference } from "./wodReferenceSchema";

/** Resolved paths to knowledge dir (cwd when running from backend, or dist-relative). */
function getKnowledgeDir(): string {
  const fromCwd = path.join(process.cwd(), "src", "domain", "knowledge");
  const fromDist = path.join(__dirname, "..", "..", "..", "domain", "knowledge");
  for (const dir of [fromCwd, fromDist]) {
    if (fs.existsSync(dir)) return dir;
  }
  return fromCwd;
}

const KNOWLEDGE_DIR = getKnowledgeDir();

/** In-memory cache of loaded WOD references so we don't re-read the large JSON on every request. */
let cachedWodRefs: WODReference[] | null = null;

function loadWodReferences(): WODReference[] {
  if (cachedWodRefs !== null) return cachedWodRefs;
  const filePath = path.join(KNOWLEDGE_DIR, "wodReferences.json");
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    const arr = Array.isArray(parsed) ? parsed : [];
    cachedWodRefs = arr as WODReference[];
    return cachedWodRefs;
  } catch {
    return [];
  }
}

/** In-memory cache of markdown snippet content (file path -> first N chars). */
const mdSnippetCache: Record<string, string> = {};
const SNIPPET_MAX_CHARS = 2200;

function readMarkdownSnippet(filename: string): string {
  if (mdSnippetCache[filename] !== undefined) return mdSnippetCache[filename];
  const filePath = path.join(KNOWLEDGE_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      mdSnippetCache[filename] = "";
      return "";
    }
    const content = fs.readFileSync(filePath, "utf-8").trim();
    const snippet = content.length <= SNIPPET_MAX_CHARS ? content : content.slice(0, SNIPPET_MAX_CHARS) + "\n\n[...]";
    mdSnippetCache[filename] = snippet;
    return snippet;
  } catch {
    mdSnippetCache[filename] = "";
    return "";
  }
}

/** Map ProgrammingInput protocol to WODReference protocol(s). */
function protocolsForInput(protocol: ProgrammingInput["protocol"]): string[] {
  if (protocol === "recommended") return ["AMRAP", "FOR_TIME", "EMOM", "TABATA", "DEATH_BY", "21_15_9"];
  return [protocol];
}

/** Map progression.targetDuration to WOD timeDomain. */
function timeDomainForInput(targetDuration: "short" | "medium" | "long"): string {
  return targetDuration;
}

/** Score WOD by equipment overlap with user (higher = more overlap). */
function equipmentOverlapScore(wod: WODReference, equipmentAvailable: string[]): number {
  if (wod.equipment.length === 0) return 1;
  const userSet = new Set(equipmentAvailable.map((e) => e.toLowerCase().replace(/_/g, " ")));
  let match = 0;
  for (const eq of wod.equipment) {
    const norm = eq.toLowerCase();
    if (userSet.has(norm) || norm === "various" || norm === "n/a") match++;
  }
  return wod.equipment.length === 0 ? 1 : match / wod.equipment.length;
}

/** Exclude WODs that are rest days or not useful as conditioning examples. */
function isConditioningWod(wod: WODReference): boolean {
  if (wod.protocol === "REST_DAY") return false;
  return true;
}

/** Select up to maxExamples WOD references relevant to this request. */
function selectWodExamples(
  input: ProgrammingInput,
  refs: WODReference[],
  maxExamples: number
): WODReference[] {
  const protocols = protocolsForInput(input.protocol);
  const timeDomain = timeDomainForInput(input.progression.targetDuration);
  const equipment = input.equipmentAvailable ?? [];

  const candidates = refs.filter(
    (w) =>
      isConditioningWod(w) &&
      protocols.includes(w.protocol) &&
      (w.timeDomain === timeDomain || w.timeDomain === "varies" || w.timeDomain === "n/a")
  );

  if (candidates.length <= maxExamples) return candidates.slice(0, maxExamples);

  const scored = candidates.map((w) => ({
    wod: w,
    score: equipmentOverlapScore(w, equipment),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxExamples).map((s) => s.wod);
}

/** Format a single WOD reference for prompt injection (structure/style only, not to copy). */
function formatWodForPrompt(wod: WODReference): string {
  const parts = [
    `- ${wod.protocolDescription}`,
    `  Time domain: ${wod.timeDomain} | Energy: ${wod.energySystem}`,
  ];
  if (wod.equipment.length > 0) parts.push(`  Equipment: ${wod.equipment.join(", ")}`);
  if (wod.stimulusNote) parts.push(`  Stimulus: ${wod.stimulusNote}`);
  if (wod.scalingTiers && wod.scalingTiers.length > 0) {
    parts.push(`  Scaling: ${wod.scalingTiers.map((t) => `${t.level}: ${t.description}`).join("; ")}`);
  }
  return parts.join("\n");
}

export interface RAGContext {
  /** Combined methodology/protocol/scaling snippets for grounding. */
  methodologySection: string;
  /** Formatted historical WOD examples (structure and stimulus only). */
  historicalWodsSection: string;
}

/**
 * Retrieves RAG context for one programming request: methodology snippets from
 * domain/knowledge/*.md and 2–3 relevant historical WODs from wodReferences.json.
 * Why included: methodology defines principles; historical WODs show structure and
 * scaling so the model generates principled, non-copied workouts.
 */
export function retrieveRAGContext(input: ProgrammingInput): RAGContext {
  const methodologyParts: string[] = [];

  const methodology = readMarkdownSnippet("methodology.md");
  if (methodology) methodologyParts.push("## Methodology\n" + methodology);

  const protocols = readMarkdownSnippet("protocols.md");
  if (protocols) methodologyParts.push("## Protocols\n" + protocols);

  const scaling = readMarkdownSnippet("scaling.md");
  if (scaling) methodologyParts.push("## Scaling\n" + scaling);

  const methodologySection =
    methodologyParts.length > 0
      ? methodologyParts.join("\n\n---\n\n")
      : "Use standard CrossFit methodology: constantly varied functional movements at high intensity; mechanics → consistency → intensity; scale to preserve stimulus.";

  const refs = loadWodReferences();
  const selected = selectWodExamples(input, refs, 3);
  const historicalWodsSection =
    selected.length > 0
      ? selected.map((w) => formatWodForPrompt(w)).join("\n\n")
      : "No matching historical examples for this protocol/time domain; use methodology and athlete context to design the WOD.";

  return { methodologySection, historicalWodsSection };
}
