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
}

export interface ProgrammingInput {
  assessment: AssessmentOutput;
  constraints: ConstraintOutput;
  progression: ProgressionOutput;
  primaryGoal: "strength" | "endurance" | "mixed" | "skill";
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
  program(input: ProgrammingInput): WorkoutSpec;
}

