import { WorkoutRepository } from "../../domain/repositories/WorkoutRepository";

export interface ProgressResult {
  totalSessions: number;
  points: { date: string; roundsOrReps: number | null }[];
}

export class GetProgressUseCase {
  constructor(private workoutRepo: WorkoutRepository) {}

  async execute(userId: string): Promise<ProgressResult> {
    const points = await this.workoutRepo.getProgressPoints(userId);
    return {
      totalSessions: points.length,
      points,
    };
  }
}
