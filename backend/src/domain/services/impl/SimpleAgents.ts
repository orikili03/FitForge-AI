import { User } from "../../entities/User";
import { WorkoutSpec } from "../../entities/Workout";
import {
  AssessmentAgent,
  AssessmentInput,
  AssessmentOutput,
  ConstraintAgent,
  ConstraintInput,
  ConstraintOutput,
  ProgressionAgent,
  ProgressionInput,
  ProgressionOutput,
  ProgrammingAgent,
  ProgrammingInput,
} from "../aiAgents";

const MOVEMENT_CATEGORIES = {
  strength: ["deadlift", "front squat", "push press", "power clean"],
  gymnastics: ["pull-up", "push-up", "air squat", "burpee"],
  monostructural: ["row", "assault bike", "run", "double-under"],
};

function inferMovementCompetency(user: User): AssessmentOutput["movementCompetency"] {
  if (user.fitnessLevel === "beginner") return "low";
  if (user.fitnessLevel === "intermediate") return "medium";
  return "high";
}

export class SimpleAssessmentAgent implements AssessmentAgent {
  assess(input: AssessmentInput): AssessmentOutput {
    const recentCount = input.recentWorkouts.length;
    const fatigueScore = Math.min(1, recentCount / 7); // simplistic: >7 sessions ~ high fatigue

    return {
      fatigueScore,
      movementCompetency: inferMovementCompetency(input.user),
    };
  }
}

export class SimpleConstraintAgent implements ConstraintAgent {
  evaluate(input: ConstraintInput): ConstraintOutput {
    const excludedMovements = [...input.user.injuryFlags, ...input.user.movementConstraints];

    const allowedMovements = Object.values(MOVEMENT_CATEGORIES)
      .flat()
      .filter((m) => !excludedMovements.includes(m));

    return {
      allowedMovements,
      excludedMovements,
    };
  }
}

export class SimpleProgressionAgent implements ProgressionAgent {
  evaluate(input: ProgressionInput): ProgressionOutput {
    const volume = input.history.length;

    if (volume < 2) {
      return { targetIntensity: "low", targetDuration: "short" };
    }

    if (volume < 5) {
      return { targetIntensity: "moderate", targetDuration: "medium" };
    }

    return { targetIntensity: "high", targetDuration: "medium" };
  }
}

export class SimpleProgrammingAgent implements ProgrammingAgent {
  program(input: ProgrammingInput): WorkoutSpec {
    const { primaryGoal, assessment, constraints, progression } = input;

    const duration =
      progression.targetDuration === "short"
        ? 10
        : progression.targetDuration === "long"
        ? 25
        : 18;

    const pool = this.pickMovementPool(primaryGoal);
    const movements = pool
      .filter((m) => constraints.allowedMovements.includes(m))
      .slice(0, 3);

    const type =
      input.protocol !== "recommended"
        ? this.protocolToDisplayType(input.protocol)
        : this.pickWodType(primaryGoal, progression.targetDuration);

    const intensityGuidance =
      assessment.fatigueScore > 0.7
        ? "Reduce loading and keep intensity moderate."
        : "Aim for high intensity, but keep mechanics sound.";

    return {
      warmup: ["5 min easy cardio", "2 rounds: 10 air squats, 10 ring rows, 10 PVC pass-throughs"],
      wod: {
        type,
        duration,
        description: `${type} ${duration} min with focus on ${primaryGoal}.`,
        movements,
      },
      scalingOptions: [
        "Reduce loading by 30-50% for strength work.",
        "Scale gymnastics to ring rows / elevated push-ups.",
        "Replace high-impact monostructural with bike/row.",
      ],
      finisher: primaryGoal === "strength" ? ["8 min easy cyclical flush."] : ["Core: 3 x 30s hollow hold."],
      intensityGuidance,
    };
  }

  private pickMovementPool(goal: ProgrammingInput["primaryGoal"]): string[] {
    switch (goal) {
      case "strength":
        return MOVEMENT_CATEGORIES.strength;
      case "skill":
        return MOVEMENT_CATEGORIES.gymnastics;
      case "endurance":
        return MOVEMENT_CATEGORIES.monostructural;
      case "mixed":
      default:
        return [
          ...MOVEMENT_CATEGORIES.strength,
          ...MOVEMENT_CATEGORIES.gymnastics,
          ...MOVEMENT_CATEGORIES.monostructural,
        ];
    }
  }

  private protocolToDisplayType(
    protocol: ProgrammingInput["protocol"]
  ): string {
    switch (protocol) {
      case "FOR_TIME":
        return "For Time";
      case "21_15_9":
        return "21-15-9";
      case "DEATH_BY":
        return "Death By";
      case "EMOM":
      case "AMRAP":
      case "TABATA":
      default:
        return protocol;
    }
  }

  private pickWodType(
    goal: ProgrammingInput["primaryGoal"],
    duration: ProgressionOutput["targetDuration"]
  ): "AMRAP" | "For Time" | "Intervals" {
    if (goal === "endurance" && duration !== "short") return "AMRAP";
    if (goal === "strength") return "Intervals";
    return "For Time";
  }
}

