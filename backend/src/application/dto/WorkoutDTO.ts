import { WorkoutSpec } from "../../domain/entities/Workout";

export interface GenerateWorkoutRequestDTO {
  timeCapMinutes: number;
  equipment: string[];
  goal: "strength" | "endurance" | "mixed" | "skill";
  protocol: "recommended" | "EMOM" | "AMRAP" | "FOR_TIME" | "TABATA" | "DEATH_BY" | "21_15_9";
}

export interface WorkoutResponseDTO extends WorkoutSpec {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
}

export interface WorkoutHistoryItemDTO extends WorkoutResponseDTO {
  completed?: boolean;
}

export interface CompleteWorkoutRequestDTO {
  workoutId: string;
  completionTime?: number;
  roundsOrReps?: number;
}

