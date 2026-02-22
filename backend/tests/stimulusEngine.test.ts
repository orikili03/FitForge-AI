import { decideStimulus } from "../src/domain/config/stimulusEngine";
import type { ProgressionOutput } from "../src/domain/services/aiAgents";

const progression = (
  overrides: Partial<ProgressionOutput> = {}
): ProgressionOutput => ({
  targetIntensity: "moderate",
  targetDuration: "medium",
  recentExposure: undefined,
  ...overrides,
});

describe("decideStimulus", () => {
  it("returns recovery-friendly stimulus when fatigue is high", () => {
    const result = decideStimulus({
      timeCapMinutes: 20,
      progression: progression(),
      fatigueScore: 0.8,
    });
    expect(result.intendedStimulusLabel).toContain("Recovery");
    expect(result.movementCount).toBe(2);
    expect(result.recommendedProtocol).toBe("FOR_TIME");
    expect(result.durationMinutes).toBeLessThanOrEqual(20);
  });

  it("uses short time domain for short cap and short target duration", () => {
    const result = decideStimulus({
      timeCapMinutes: 15,
      progression: progression({ targetDuration: "short" }),
      fatigueScore: 0,
    });
    expect(result.stimulus).toBe("sprint");
    expect(result.durationMinutes).toBe(10);
    expect(result.intendedStimulusLabel).toContain("Sprint");
  });

  it("uses long aerobic for long cap and long target duration", () => {
    const result = decideStimulus({
      timeCapMinutes: 45,
      progression: progression({ targetDuration: "long" }),
      fatigueScore: 0,
    });
    expect(result.stimulus).toBe("long_aerobic");
    expect(result.durationMinutes).toBe(40);
    expect(result.intendedStimulusLabel).toContain("aerobic");
  });

  it("returns AMRAP for medium/long non-recovery", () => {
    const result = decideStimulus({
      timeCapMinutes: 30,
      progression: progression({ targetDuration: "medium" }),
      fatigueScore: 0,
    });
    expect(result.recommendedProtocol).toBe("AMRAP");
    expect(result.movementCount).toBe(3);
  });
});
