import { workoutSpecSchema } from "../src/domain/services/impl/GroqProgrammingAgent";

const validPayload = {
  warmup: [],
  wod: {
    type: "AMRAP",
    duration: 12,
    description: "AMRAP 12",
    movements: ["Row", "AS"],
    rounds: null,
    movementItems: [
      { reps: 100, name: "Row", weight: null, distance: "100m" },
      { reps: 10, name: "AS", weight: null, distance: null },
    ],
  },
  scalingOptions: ["Reduce distance"],
  intensityGuidance: "Sustain pace.",
  timeDomain: "<12 min",
  movementEmphasis: ["Row", "AS"],
  stimulusNote: "Unbroken if possible.",
};

describe("workoutSpecSchema", () => {
  it("parses valid payload", () => {
    const result = workoutSpecSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wod.movements).toEqual(["Row", "AS"]);
      expect(result.data.wod.movementItems).toHaveLength(2);
    }
  });

  it("rejects empty movements array", () => {
    const invalid = { ...validPayload, wod: { ...validPayload.wod, movements: [] } };
    const result = workoutSpecSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects missing intensityGuidance", () => {
    const { intensityGuidance: _, ...rest } = validPayload;
    const result = workoutSpecSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts null duration (For Time / RFT / 21-15-9)", () => {
    const withNullDuration = { ...validPayload, wod: { ...validPayload.wod, duration: null } };
    const result = workoutSpecSchema.safeParse(withNullDuration);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.wod.duration).toBeNull();
  });

  it("rejects zero duration when provided", () => {
    const invalid = { ...validPayload, wod: { ...validPayload.wod, duration: 0 } };
    const result = workoutSpecSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("accepts optional finisher", () => {
    const withFinisher = { ...validPayload, finisher: ["Stretch"] };
    const result = workoutSpecSchema.safeParse(withFinisher);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.finisher).toEqual(["Stretch"]);
  });
});
