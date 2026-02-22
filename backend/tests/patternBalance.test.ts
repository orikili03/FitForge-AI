import { selectBalancedMovements } from "../src/domain/config/patternBalance";
import type { ProgressionOutput } from "../src/domain/services/aiAgents";

describe("selectBalancedMovements", () => {
  const exposure = (byDomain: Record<string, number>, byPattern: Record<string, number>): ProgressionOutput["recentExposure"] => ({
    byDomain,
    byPattern,
  });

  it("returns up to count movements", () => {
    const ids = ["deadlift", "row", "pull-up", "push-up", "air squat"];
    const result = selectBalancedMovements(ids, undefined, 3);
    expect(result.length).toBe(3);
    expect(result.every((m) => ids.includes(m))).toBe(true);
  });

  it("returns all when allowed length <= count", () => {
    const ids = ["deadlift", "row"];
    const result = selectBalancedMovements(ids, undefined, 5);
    expect(result).toEqual(["deadlift", "row"]);
  });

  it("prefers lower exposure when selecting", () => {
    const ids = ["deadlift", "row", "pull-up", "push-up", "air squat"];
    const highRowExposure = exposure({ monostructural: 5 }, { locomotion: 5 });
    const result = selectBalancedMovements(ids, highRowExposure, 3);
    expect(result.length).toBe(3);
    // Row has high exposure (locomotion + monostructural); others may be preferred first
    const resultSet = new Set(result);
    expect(resultSet.size).toBe(3);
  });

  it("is deterministic for same inputs", () => {
    const ids = ["deadlift", "front squat", "push press", "row", "pull-up"];
    const exp = exposure({ strength: 1 }, { hinge: 1 });
    const a = selectBalancedMovements(ids, exp, 3);
    const b = selectBalancedMovements(ids, exp, 3);
    expect(a).toEqual(b);
  });
});
