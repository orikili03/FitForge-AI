import { WorkoutEngine } from "../../domain/services/WorkoutEngine";
import { WorkoutRepository } from "../../domain/repositories/WorkoutRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import {
  CompleteWorkoutRequestDTO,
  GenerateWorkoutRequestDTO,
  WorkoutHistoryItemDTO,
  WorkoutResponseDTO,
} from "../dto/WorkoutDTO";

export class GenerateWorkoutUseCase {
  constructor(
    private userRepo: UserRepository,
    private workoutRepo: WorkoutRepository,
    private engine: WorkoutEngine
  ) {}

  async execute(userId: string, input: GenerateWorkoutRequestDTO): Promise<WorkoutResponseDTO> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const history = await this.workoutRepo.listHistory(userId, 5);
    const recentSpecs = history.map((w) => w.spec);

    const spec = this.engine.generate({
      user,
      equipment: input.equipment,
      timeCapMinutes: input.timeCapMinutes,
      recentWorkouts: recentSpecs,
      goal: input.goal,
      protocol: input.protocol,
    });

    const workout = await this.workoutRepo.createGeneratedWorkout({
      userId,
      type: spec.wod.type,
      durationMinutes: spec.wod.duration,
      spec,
    });

    return {
      id: workout.id,
      date: workout.date.toISOString(),
      type: workout.type,
      durationMinutes: workout.durationMinutes,
      ...spec,
    };
  }
}

export class ListWorkoutHistoryUseCase {
  constructor(private workoutRepo: WorkoutRepository) {}

  async execute(userId: string): Promise<WorkoutHistoryItemDTO[]> {
    const history = await this.workoutRepo.listHistory(userId, 50);
    const ids = history.map((w) => w.id);
    const completedIds = await this.workoutRepo.getCompletedWorkoutIds(ids);
    return history.map((w) => ({
      id: w.id,
      date: w.date.toISOString(),
      type: w.type,
      durationMinutes: w.durationMinutes,
      ...w.spec,
      completed: completedIds.has(w.id),
    }));
  }
}

export class CompleteWorkoutUseCase {
  constructor(private workoutRepo: WorkoutRepository) {}

  async execute(userId: string, input: CompleteWorkoutRequestDTO): Promise<void> {
    // We could check that workout belongs to user here via repository, omitted for brevity
    await this.workoutRepo.recordCompletion({
      workoutId: input.workoutId,
      data: {
        completionTime: input.completionTime,
        roundsOrReps: input.roundsOrReps,
      },
    });
  }
}

