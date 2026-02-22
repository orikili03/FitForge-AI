import { extractJsonFromLlmResponse } from "../src/domain/services/impl/GroqProgrammingAgent";

describe("extractJsonFromLlmResponse", () => {
  const validJson = '{"warmup":[],"wod":{"type":"AMRAP","duration":12,"description":"AMRAP 12","movements":["Row","AS"],"rounds":null,"movementItems":[{"reps":100,"name":"Row","weight":null,"distance":"100m"},{"reps":10,"name":"AS","weight":null,"distance":null}]},"scalingOptions":["Reduce distance"],"intensityGuidance":"Go hard."}';

  it("returns trimmed string when already plain JSON", () => {
    expect(extractJsonFromLlmResponse(validJson)).toBe(validJson);
    expect(extractJsonFromLlmResponse("  " + validJson + "\n")).toBe(validJson);
  });

  it("strips markdown code fence with json label", () => {
    const wrapped = "```json\n" + validJson + "\n```";
    expect(extractJsonFromLlmResponse(wrapped)).toBe(validJson);
  });

  it("strips markdown code fence without label", () => {
    const wrapped = "```\n" + validJson + "\n```";
    expect(extractJsonFromLlmResponse(wrapped)).toBe(validJson);
  });

  it("extracts first { to last } when text surrounds JSON", () => {
    const withPreamble = "Here is the workout:\n" + validJson + "\nHope you enjoy.";
    expect(extractJsonFromLlmResponse(withPreamble)).toBe(validJson);
  });

  it("handles code fence with trailing whitespace", () => {
    const wrapped = "```json\n" + validJson + "\n```  \n";
    expect(extractJsonFromLlmResponse(wrapped)).toBe(validJson);
  });
});
