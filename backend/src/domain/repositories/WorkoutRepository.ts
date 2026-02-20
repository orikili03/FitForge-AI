import { Workout, WorkoutSpec } from "../entities/Workout";

export interface WorkoutCompletionData {
  rpe: number;
  completionTime?: number;
  roundsOrReps?: number;
  notes?: string;
}

export interface WorkoutRepository {
  createGeneratedWorkout(params: {
    userId: string;
    type: string;
    durationMinutes: number;
    spec: WorkoutSpec;
  }): Promise<Workout>;

  listHistory(userId: string, limit?: number): Promise<Workout[]>;

  recordCompletion(params: {
    workoutId: string;
    data: WorkoutCompletionData;
  }): Promise<void>;
}

