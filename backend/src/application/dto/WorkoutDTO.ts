import { WorkoutSpec } from "../../domain/entities/Workout";

export interface GenerateWorkoutRequestDTO {
  timeCapMinutes: number;
  equipment: string[];
  goal: "strength" | "endurance" | "mixed" | "skill";
}

export interface WorkoutResponseDTO extends WorkoutSpec {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
}

export interface WorkoutHistoryItemDTO extends WorkoutResponseDTO {}

export interface CompleteWorkoutRequestDTO {
  workoutId: string;
  rpe: number;
  completionTime?: number;
  roundsOrReps?: number;
  notes?: string;
}

