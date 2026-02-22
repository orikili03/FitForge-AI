import { User } from "../../entities/User";
import { WorkoutSpec, type MovementItemSpec } from "../../entities/Workout";
import { getMovementsForEquipment } from "../../config/equipmentMovementMap";
import { computeRecentExposure, getDomain } from "../../config/movementTags";
import { getScalingForMovements } from "../../config/scalingRules";
import { MOVEMENTS_BY_DOMAIN } from "../../config/movementCatalog";
import {
  getPrescriptionName,
  getPrescriptionWeight,
} from "../../config/movementPrescription";
import { expandForDisplay } from "../../config/abbreviations";
import { decideStimulus } from "../../config/stimulusEngine";
import { selectBalancedMovements } from "../../config/patternBalance";
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
    const equipmentAllowed = getMovementsForEquipment(input.equipmentAvailable);
    const allowedMovements = [...equipmentAllowed].filter((m) => !excludedMovements.includes(m));

    return {
      allowedMovements,
      excludedMovements,
    };
  }
}

export class SimpleProgressionAgent implements ProgressionAgent {
  evaluate(input: ProgressionInput): ProgressionOutput {
    const volume = input.history.length;
    const recentExposure = computeRecentExposure(input.history, 7);

    if (volume < 2) {
      return { targetIntensity: "low", targetDuration: "short", recentExposure };
    }

    if (volume < 5) {
      return { targetIntensity: "moderate", targetDuration: "medium", recentExposure };
    }

    return { targetIntensity: "high", targetDuration: "medium", recentExposure };
  }
}

export class SimpleProgrammingAgent implements ProgrammingAgent {
  async program(input: ProgrammingInput): Promise<WorkoutSpec> {
    const { assessment, constraints, progression } = input;

    const stimulusDecision = decideStimulus({
      timeCapMinutes: input.timeCapMinutes,
      progression,
      fatigueScore: assessment.fatigueScore,
    });

    const effectiveProtocol =
      input.protocol !== "recommended"
        ? input.protocol
        : stimulusDecision.recommendedProtocol;

    const duration = stimulusDecision.durationMinutes;
    // 21-15-9: limit to 1–3 movements (focus on speed, stamina, cardio); default 2 for classic structure
    const movementCount =
      effectiveProtocol === "21_15_9"
        ? Math.min(3, Math.max(1, 2))
        : Math.min(3, Math.max(2, stimulusDecision.movementCount));

    const pool = this.pickMovementPool();
    const allowed = pool.filter((m) => constraints.allowedMovements.includes(m));
    const fallbackPool = [
      ...MOVEMENTS_BY_DOMAIN.strength,
      ...MOVEMENTS_BY_DOMAIN.gymnastics,
      ...MOVEMENTS_BY_DOMAIN.monostructural,
    ];
    const allowedOrFallback =
      allowed.length > 0 ? allowed : fallbackPool.filter((m) => constraints.allowedMovements.includes(m));
    const movements = selectBalancedMovements(
      allowedOrFallback,
      progression.recentExposure,
      movementCount
    );
    const type = this.protocolToDisplayType(effectiveProtocol);

    const intensityGuidance =
      assessment.fatigueScore > 0.7
        ? "Reduce loading and keep intensity moderate."
        : "Aim for high intensity, but keep mechanics sound.";

    const timeDomain = this.deriveTimeDomain(duration, input.timeCapMinutes);
    const equipment = input.equipmentAvailable ?? [];
    const movementNamesAbbrev = movements.map((m) => getPrescriptionName(m, equipment));
    const movementEmphasis = [...movementNamesAbbrev];
    const { description, stimulusNote } = this.buildWodDescription(
      type,
      duration,
      effectiveProtocol,
      movementNamesAbbrev,
      assessment.fatigueScore
    );
    const { rounds, movementItems } = this.buildMovementItems(
      effectiveProtocol,
      duration,
      movements,
      equipment
    );
    const movementNames = movements.map((m) => getPrescriptionName(m, equipment));
    const timeCappedProtocols = ["AMRAP", "EMOM", "TABATA", "DEATH_BY"];
    const hasDuration = timeCappedProtocols.includes(effectiveProtocol);
    return {
      warmup: [], // warmups disabled for now
      wod: {
        type,
        ...(hasDuration && { duration }),
        description,
        movements: movementNames,
        rounds,
        movementItems,
      },
      scalingOptions: getScalingForMovements(movements, input.equipmentAvailable ?? []),
      intensityGuidance,
      timeDomain,
      movementEmphasis,
      stimulusNote,
    };
  }

  /** Rule-based warmup suggestions from selected movements (e.g. row → dynamic stretch + light row). */
  private suggestWarmup(movements: string[]): string[] {
    const suggestions: string[] = [];
    const hasSquat = movements.some((m) => getDomain(m) === "strength" && m.includes("squat")) ||
      movements.includes("air squat");
    const hasHinge = movements.some((m) => m.includes("deadlift") || m.includes("clean") || m.includes("burpee"));
    const hasPull = movements.some((m) => m.includes("pull") || m.includes("row"));
    const hasPush = movements.some((m) => m.includes("push") || m.includes("burpee"));
    const hasMono = movements.some((m) => ["row", "run", "assault bike", "double-under"].includes(m));
    if (hasMono) suggestions.push("3–5 min light cardio (same modality if possible)");
    if (hasSquat || hasHinge) suggestions.push("Hip and ankle mobility; empty-bar or bodyweight squats");
    if (hasPull) suggestions.push("Band pull-aparts or light pulling prep");
    if (hasPush) suggestions.push("Shoulder circles and light push-up prep");
    if (suggestions.length === 0) suggestions.push("General dynamic warm-up (5 min)");
    return suggestions;
  }

  /** Build rounds (when applicable) and movementItems with reps, equipment, and weight (abbreviated names). */
  private buildMovementItems(
    protocol: ProgrammingInput["protocol"],
    duration: number,
    movements: string[],
    equipmentAvailable: string[]
  ): { rounds?: number; movementItems: MovementItemSpec[] } {
    const name = (m: string) => getPrescriptionName(m, equipmentAvailable);
    const weight = (m: string) => getPrescriptionWeight(m);

    if (protocol === "21_15_9" && movements.length >= 1) {
      const repsScheme = [21, 15, 9];
      return {
        movementItems: movements.slice(0, 3).map((m, i) => ({
          reps: repsScheme[i] ?? 9,
          name: name(m),
          weight: weight(m),
        })),
      };
    }
    if (protocol === "AMRAP") {
      const reps = movements.length === 3 ? [5, 10, 15] : movements.length === 2 ? [10, 15] : [10];
      return {
        movementItems: movements.map((m, i) => ({
          reps: reps[i] ?? 10,
          name: name(m),
          weight: weight(m),
        })),
      };
    }
    if (protocol === "EMOM") {
      const reps = movements.length === 3 ? [5, 8, 10] : [8, 10];
      return {
        movementItems: movements.slice(0, 2).map((m, i) => ({
          reps: reps[i] ?? 8,
          name: name(m),
          weight: weight(m),
        })),
      };
    }
    if (
      protocol === "FOR_TIME" ||
      protocol === "TABATA" ||
      protocol === "DEATH_BY"
    ) {
      const rounds = duration <= 15 ? 2 : duration <= 25 ? 3 : 4;
      const reps = movements.length === 3 ? [10, 15, 20] : movements.length === 2 ? [12, 18] : [15];
      return {
        rounds,
        movementItems: movements.map((m, i) => ({
          reps: reps[i] ?? 15,
          name: name(m),
          weight: weight(m),
        })),
      };
    }
    return {
      movementItems: movements.map((m) => ({
        reps: 10,
        name: name(m),
        weight: weight(m),
      })),
    };
  }

  /** CrossFit-style simple WOD: clear rep scheme, 2–3 movements, short stimulus note. Uses expanded names for display. */
  private buildWodDescription(
    type: string,
    duration: number,
    protocol: ProgrammingInput["protocol"],
    movementNamesAbbrev: string[],
    fatigueScore: number
  ): { description: string; stimulusNote: string } {
    const m1 = movementNamesAbbrev[0] ? expandForDisplay(movementNamesAbbrev[0]) : "";
    const m2 = movementNamesAbbrev[1] ? expandForDisplay(movementNamesAbbrev[1]) : "";
    const m3 = movementNamesAbbrev[2] ? expandForDisplay(movementNamesAbbrev[2]) : "";

    const n = movementNamesAbbrev.length;
    let description: string;
    if (protocol === "21_15_9" && n >= 1) {
      description = `21-15-9 reps for time: ${m1}, ${m2}${m3 ? `, ${m3}` : ""}`;
    } else if (protocol === "AMRAP") {
      const reps = n === 3 ? [5, 10, 15] : n === 2 ? [10, 15] : [10];
      const parts = movementNamesAbbrev.map((m, i) => `${reps[i] ?? 10} ${expandForDisplay(m)}`).join(", ");
      description = `AMRAP ${duration} min: ${parts}`;
    } else if (protocol === "EMOM") {
      const reps = n === 3 ? [5, 8, 10] : [8, 10];
      const parts = movementNamesAbbrev.slice(0, 2).map((m, i) => `${reps[i]} ${expandForDisplay(m)}`).join(", ");
      description = `EMOM ${duration} min: ${parts}`;
    } else if (protocol === "FOR_TIME" || protocol === "TABATA" || protocol === "DEATH_BY") {
      const rounds = duration <= 15 ? 2 : duration <= 25 ? 3 : 4;
      const reps = n === 3 ? [10, 15, 20] : n === 2 ? [12, 18] : [15];
      const parts = movementNamesAbbrev.map((m, i) => `${reps[i]} ${expandForDisplay(m)}`).join(", ");
      description = `${rounds} rounds for time: ${parts}`;
    } else {
      description = `${type} ${duration} min: ${[m1, m2, m3].filter(Boolean).join(", ")}`;
    }

    const stimulusNote =
      fatigueScore > 0.7
        ? "Today: keep mechanics sound and pace steady; scale load or reps as needed."
        : "Push a steady pace; scale so you can complete rounds in 2–3 sets per movement when possible.";

    return { description, stimulusNote };
  }

  private deriveTimeDomain(duration: number, timeCapMinutes: number): string {
    const cap = timeCapMinutes > 0 ? timeCapMinutes : duration;
    if (cap < 10) return "<10 min";
    if (cap <= 20) return "10–20 min";
    return "20+ min";
  }

  private pickMovementPool(): string[] {
    return [
      ...MOVEMENTS_BY_DOMAIN.strength,
      ...MOVEMENTS_BY_DOMAIN.gymnastics,
      ...MOVEMENTS_BY_DOMAIN.monostructural,
    ];
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
}

