import { WorkoutSpec } from "../entities/Workout";
import { User } from "../entities/User";

export interface AssessmentInput {
  user: User;
  recentWorkouts: WorkoutSpec[];
}

export interface AssessmentOutput {
  fatigueScore: number; // 0-1
  movementCompetency: "low" | "medium" | "high";
}

export interface ConstraintInput {
  user: User;
  timeCapMinutes: number;
  equipmentAvailable: string[];
}

export interface ConstraintOutput {
  allowedMovements: string[];
  excludedMovements: string[];
}

export interface ProgressionInput {
  user: User;
  history: WorkoutSpec[];
}

export interface ProgressionOutput {
  targetIntensity: "low" | "moderate" | "high";
  targetDuration: "short" | "medium" | "long";
  /** Recent exposure by domain and pattern (for variation). */
  recentExposure?: { byDomain: Record<string, number>; byPattern: Record<string, number> };
}

export interface ProgrammingInput {
  assessment: AssessmentOutput;
  constraints: ConstraintOutput;
  progression: ProgressionOutput;
  protocol: "recommended" | "EMOM" | "AMRAP" | "FOR_TIME" | "TABATA" | "DEATH_BY" | "21_15_9";
  timeCapMinutes: number;
  /** User's equipment IDs (e.g. barbell, kettlebells) for prescribing equipment in movement names */
  equipmentAvailable?: string[];
  injuries?: string;
}

export interface AssessmentAgent {
  assess(input: AssessmentInput): AssessmentOutput;
}

export interface ConstraintAgent {
  evaluate(input: ConstraintInput): ConstraintOutput;
}

export interface ProgressionAgent {
  evaluate(input: ProgressionInput): ProgressionOutput;
}

export interface ProgrammingAgent {
  program(input: ProgrammingInput): Promise<WorkoutSpec>;
}

