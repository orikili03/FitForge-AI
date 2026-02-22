import { WorkoutModel, WorkoutCompletionModel } from "../database/models";
import {
  WorkoutRepository,
  WorkoutCompletionData,
} from "../../domain/repositories/WorkoutRepository";
import { Workout, WorkoutSpec } from "../../domain/entities/Workout";

export class MongooseWorkoutRepository implements WorkoutRepository {
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

  async findById(id: string): Promise<Workout | null> {
    const record = await WorkoutModel.findById(id).exec();
    return record ? this.toDomain(record) : null;
  }

  async listHistory(userId: string, limit = 20): Promise<Workout[]> {
    const records = await WorkoutModel.find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .exec();
    return records.map((r) => this.toDomain(r));
  }

  async getCompletedWorkoutIds(workoutIds: string[]): Promise<Set<string>> {
    if (workoutIds.length === 0) return new Set();
    const completions = await WorkoutCompletionModel.find({
      workoutId: { $in: workoutIds },
    })
      .select("workoutId")
      .lean()
      .exec();
    return new Set(completions.map((c) => c.workoutId));
  }

  async getCompletionDataForWorkouts(
    workoutIds: string[]
  ): Promise<Map<string, { completionTime?: number; roundsOrReps?: number }>> {
    if (workoutIds.length === 0) return new Map();
    const completions = await WorkoutCompletionModel.find({
      workoutId: { $in: workoutIds },
    })
      .select("workoutId completionTime roundsOrReps")
      .lean()
      .exec();
    const map = new Map<string, { completionTime?: number; roundsOrReps?: number }>();
    for (const c of completions) {
      const id = String(c.workoutId);
      map.set(id, {
        completionTime: c.completionTime ?? undefined,
        roundsOrReps: c.roundsOrReps ?? undefined,
      });
    }
    return map;
  }

  async recordCompletion(params: {
    workoutId: string;
    data: WorkoutCompletionData;
  }): Promise<void> {
    await WorkoutCompletionModel.create({
      workoutId: params.workoutId,
      completionTime: params.data.completionTime,
      roundsOrReps: params.data.roundsOrReps,
    });
  }

  async updateSpec(workoutId: string, spec: WorkoutSpec): Promise<void> {
    await WorkoutModel.findByIdAndUpdate(
      workoutId,
      { generatedSpec: spec as any },
      { new: true }
    ).exec();
  }

  async getProgressPoints(userId: string): Promise<{ date: string; roundsOrReps: number | null }[]> {
    const workouts = await WorkoutModel.find({ userId }).select("_id").exec();
    const workoutIds = workouts.map((w) => w._id.toString());
    const completions = await WorkoutCompletionModel.find({
      workoutId: { $in: workoutIds },
    })
      .sort({ completedAt: 1 })
      .lean()
      .exec();
    return completions.map((c) => ({
      date: c.completedAt.toISOString(),
      roundsOrReps: c.roundsOrReps ?? null,
    }));
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
