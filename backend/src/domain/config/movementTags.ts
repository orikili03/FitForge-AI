/**
 * Movement exposure and recent-use tracking. Uses movementCatalog for domain/pattern.
 * Used to compute recent exposure and prefer under-used domains/patterns (variation over time).
 */

import {
  getDomain as getDomainFromCatalog,
  getPatterns as getPatternsFromCatalog,
  type Domain,
  type Pattern,
} from "./movementCatalog";

export type { Domain, Pattern };

export function getDomain(movement: string): Domain | undefined {
  return getDomainFromCatalog(movement);
}

export function getPatterns(movement: string): Pattern[] {
  return getPatternsFromCatalog(movement);
}

export interface RecentExposure {
  byDomain: Record<string, number>;
  byPattern: Record<string, number>;
}

export function computeRecentExposure(
  history: { wod?: { movements?: string[] } }[],
  windowSize = 7
): RecentExposure {
  const byDomain: Record<string, number> = {};
  const byPattern: Record<string, number> = {};
  const recent = history.slice(-windowSize);
  for (const w of recent) {
    const movements = w.wod?.movements ?? [];
    for (const m of movements) {
      const d = getDomainFromCatalog(m);
      if (d) byDomain[d] = (byDomain[d] ?? 0) + 1;
      for (const p of getPatternsFromCatalog(m)) {
        byPattern[p] = (byPattern[p] ?? 0) + 1;
      }
    }
  }
  return { byDomain, byPattern };
}
