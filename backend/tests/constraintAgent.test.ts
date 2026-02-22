import { SimpleConstraintAgent } from "../src/domain/services/impl/SimpleAgents";
import { User } from "../src/domain/entities/User";

describe("SimpleConstraintAgent", () => {
  const agent = new SimpleConstraintAgent();

  it("allows only movements from equipment and excludes injury/constraint movements", () => {
    const user = new User({
      id: "u1",
      email: "a@b.com",
      passwordHash: "h",
      fitnessLevel: "intermediate",
      goals: [],
      equipmentAccess: ["barbell", "rower"],
      movementConstraints: [],
      injuryFlags: ["pull-up"],
    });
    const result = agent.evaluate({
      user,
      timeCapMinutes: 20,
      equipmentAvailable: ["barbell", "rower"],
    });
    expect(result.allowedMovements).toContain("deadlift");
    expect(result.allowedMovements).toContain("row");
    expect(result.allowedMovements).not.toContain("pull-up");
    expect(result.excludedMovements).toContain("pull-up");
  });

  it("excludes movement constraints from allowed", () => {
    const user = new User({
      id: "u1",
      email: "a@b.com",
      passwordHash: "h",
      fitnessLevel: "intermediate",
      goals: [],
      equipmentAccess: ["barbell"],
      movementConstraints: ["power clean"],
      injuryFlags: [],
    });
    const result = agent.evaluate({
      user,
      timeCapMinutes: 20,
      equipmentAvailable: ["barbell"],
    });
    expect(result.allowedMovements).not.toContain("power clean");
    expect(result.excludedMovements).toContain("power clean");
  });

  it("includes bodyweight movements when equipment is empty", () => {
    const user = new User({
      id: "u1",
      email: "a@b.com",
      passwordHash: "h",
      fitnessLevel: "beginner",
      goals: [],
      equipmentAccess: [],
      movementConstraints: [],
      injuryFlags: [],
    });
    const result = agent.evaluate({
      user,
      timeCapMinutes: 15,
      equipmentAvailable: [],
    });
    expect(result.allowedMovements).toContain("air squat");
    expect(result.allowedMovements).toContain("push-up");
  });
});
