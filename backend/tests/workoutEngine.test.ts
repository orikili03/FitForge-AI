import { WorkoutEngine } from "../src/domain/services/WorkoutEngine";
import {
  SimpleAssessmentAgent,
  SimpleConstraintAgent,
  SimpleProgressionAgent,
  SimpleProgrammingAgent,
} from "../src/domain/services/impl/SimpleAgents";
import { User } from "../src/domain/entities/User";
import { WorkoutSpec } from "../src/domain/entities/Workout";

describe("WorkoutEngine", () => {
  const user = new User({
    id: "u1",
    email: "test@example.com",
    passwordHash: "hash",
    fitnessLevel: "intermediate",
    goals: ["strength", "engine"],
    equipmentAccess: ["barbell", "rower"],
    movementConstraints: [],
    injuryFlags: [],
  });

  const recent: WorkoutSpec[] = [];

  const engine = new WorkoutEngine(
    new SimpleAssessmentAgent(),
    new SimpleConstraintAgent(),
    new SimpleProgressionAgent(),
    new SimpleProgrammingAgent()
  );

  it("generates a workout spec with warmup, wod, scaling, and intensity", () => {
    const spec = engine.generate({
      user,
      equipment: user.equipmentAccess,
      timeCapMinutes: 20,
      recentWorkouts: recent,
      goal: "mixed",
    });

    expect(spec.warmup.length).toBeGreaterThan(0);
    expect(spec.wod.type).toBeDefined();
    expect(spec.wod.movements.length).toBeGreaterThan(0);
    expect(spec.scalingOptions.length).toBeGreaterThan(0);
    expect(spec.intensityGuidance.length).toBeGreaterThan(0);
  });
});

