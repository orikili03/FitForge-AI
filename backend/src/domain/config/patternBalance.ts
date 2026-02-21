/**
 * Per-workout movement pattern balance. Ensures WODs don't stack the same pattern
 * (e.g. three pulls or three hinges). Prefers spread across push/pull/squat/hinge/locomotion
 * for balanced stimulus and injury prevention.
 */

import { getDomain, getPrimaryPattern } from "./movementCatalog";
import type { ProgressionOutput } from "../services/aiAgents";

/** Max times a single primary pattern can appear in the selected movements. */
const MAX_PER_PRIMARY_PATTERN = 2;

/**
 * From a list of allowed movement IDs, selects up to `count` movements that:
 * 1. Prefer pattern balance (avoid overloading one pattern).
 * 2. Prefer lower recent exposure (variation over time).
 * Deterministic: same inputs → same selection.
 */
export function selectBalancedMovements(
  allowedMovementIds: string[],
  recentExposure: ProgressionOutput["recentExposure"],
  count: number
): string[] {
  if (allowedMovementIds.length <= count) return allowedMovementIds.slice(0, count);

  const byPattern = recentExposure?.byPattern ?? {};
  const byDomain = recentExposure?.byDomain ?? {};

  const exposureScore = (m: string): number => {
    const primary = getPrimaryPattern(m);
    const patternScore = primary ? byPattern[primary] ?? 0 : 0;
    const d = getDomain(m);
    const domainScore = d ? byDomain[d] ?? 0 : 0;
    return patternScore + domainScore;
  };

  const selected: string[] = [];
  const patternCount: Record<string, number> = {};
  const remaining = [...allowedMovementIds].sort((a, b) => exposureScore(a) - exposureScore(b));

  while (selected.length < count && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -1;
    let fallbackIdx = 0;
    let fallbackExposure = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const m = remaining[i];
      const primary = getPrimaryPattern(m);
      const patternUsage = primary ? patternCount[primary] ?? 0 : 0;
      const overLimit = primary ? patternUsage >= MAX_PER_PRIMARY_PATTERN : false;
      const exposure = exposureScore(m);
      if (exposure < fallbackExposure) {
        fallbackExposure = exposure;
        fallbackIdx = i;
      }
      if (overLimit) continue;
      const balanceBonus = primary ? (MAX_PER_PRIMARY_PATTERN - patternUsage) * 10 : 0;
      const score = balanceBonus - exposure;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    const idx = bestScore >= 0 ? bestIdx : fallbackIdx;
    const chosen = remaining[idx];
    remaining.splice(idx, 1);
    selected.push(chosen);
    const p = getPrimaryPattern(chosen);
    if (p) patternCount[p] = (patternCount[p] ?? 0) + 1;
  }

  return selected;
}
