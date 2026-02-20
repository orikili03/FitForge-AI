import { WorkoutModel, WorkoutCompletionModel } from "../database/models";
import {
  WorkoutRepository,
  WorkoutCompletionData,
} from "../../domain/repositories/WorkoutRepository";
import { Workout, WorkoutSpec } from "../../domain/entities/Workout";

export class PrismaWorkoutRepository implements WorkoutRepository {
  async createGeneratedWorkout(params: {
    userId: string;
    type: string;
    durationMinutes: number;
    spec: WorkoutSpec;
  }): Promise<Workout> {
    const record = await WorkoutModel.create({
      userId: params.userId,
      type: params.type,
      durationMinutes: params.durationMinutes,
      generatedSpec: params.spec as any,
    });
    return this.toDomain(record);
  }

  async listHistory(userId: string, limit = 20): Promise<Workout[]> {
    const records = await WorkoutModel.find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .exec();
    return records.map((r) => this.toDomain(r));
  }

  async recordCompletion(params: {
    workoutId: string;
    data: WorkoutCompletionData;
  }): Promise<void> {
    await WorkoutCompletionModel.create({
      workoutId: params.workoutId,
      rpe: params.data.rpe,
      completionTime: params.data.completionTime,
      roundsOrReps: params.data.roundsOrReps,
      notes: params.data.notes,
    });
  }

  private toDomain(record: any): Workout {
    return new Workout({
      id: record._id.toString(),
      userId: record.userId,
      date: record.date ?? record.createdAt,
      type: record.type,
      durationMinutes: record.durationMinutes,
      spec: record.generatedSpec as WorkoutSpec,
    });
  }
}

