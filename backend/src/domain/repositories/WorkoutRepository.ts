import { Workout, WorkoutSpec } from "../entities/Workout";

export interface WorkoutCompletionData {
  completionTime?: number;
  roundsOrReps?: number;
}

export interface WorkoutRepository {
  createGeneratedWorkout(params: {
    userId: string;
    type: string;
    durationMinutes: number;
    spec: WorkoutSpec;
  }): Promise<Workout>;

  findById(id: string): Promise<Workout | null>;

  listHistory(userId: string, limit?: number): Promise<Workout[]>;

  getCompletedWorkoutIds(workoutIds: string[]): Promise<Set<string>>;

  /** Completion stats (time in seconds, rounds/reps) per workout ID. */
  getCompletionDataForWorkouts(workoutIds: string[]): Promise<Map<string, { completionTime?: number; roundsOrReps?: number }>>;

  recordCompletion(params: {
    workoutId: string;
    data: WorkoutCompletionData;
  }): Promise<void>;

  /** Update the stored spec (e.g. after scaling). */
  updateSpec(workoutId: string, spec: WorkoutSpec): Promise<void>;

  /** Progress data for analytics: completions for the user, sorted by completedAt. */
  getProgressPoints(userId: string): Promise<{ date: string; roundsOrReps: number | null }[]>;
}

