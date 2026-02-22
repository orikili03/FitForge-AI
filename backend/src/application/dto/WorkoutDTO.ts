import { WorkoutSpec } from "../../domain/entities/Workout";

export interface GenerateWorkoutRequestDTO {
  timeCapMinutes: number;
  equipment: string[];
  protocol: "recommended" | "EMOM" | "AMRAP" | "FOR_TIME" | "TABATA" | "DEATH_BY" | "21_15_9";
  injuries?: string;
  /** Preset name for display (e.g. "Home/Garage", "Travel", custom name). */
  presetName?: string;
}

export interface WorkoutResponseDTO extends WorkoutSpec {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
}

export interface WorkoutHistoryItemDTO extends WorkoutResponseDTO {
  completed?: boolean;
  completionTime?: number;
  roundsOrReps?: number;
}

export interface CompleteWorkoutRequestDTO {
  workoutId: string;
  completionTime?: number;
  roundsOrReps?: number;
  /** Optional: scaled spec as performed; when provided, updates stored workout spec. */
  spec?: WorkoutSpec;
}

