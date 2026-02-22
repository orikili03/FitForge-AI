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

    const spec = await this.engine.generate({
      user,
      equipment: input.equipment,
      timeCapMinutes: input.timeCapMinutes,
      recentWorkouts: recentSpecs,
      protocol: input.protocol,
      injuries: input.injuries,
    });

    const specWithRig = {
      ...spec,
      ...(input.presetName && { equipmentPresetName: input.presetName }),
      equipmentUsed: input.equipment,
    };

    const workout = await this.workoutRepo.createGeneratedWorkout({
      userId,
      type: spec.wod.type,
      durationMinutes: spec.wod.duration ?? 0,
      spec: specWithRig,
    });

    return {
      id: workout.id,
      date: workout.date.toISOString(),
      type: workout.type,
      durationMinutes: workout.durationMinutes,
      ...specWithRig,
    };
  }
}

export class ListWorkoutHistoryUseCase {
  constructor(private workoutRepo: WorkoutRepository) {}

  async execute(userId: string): Promise<WorkoutHistoryItemDTO[]> {
    const history = await this.workoutRepo.listHistory(userId, 50);
    const ids = history.map((w) => w.id);
    const [completedIds, completionData] = await Promise.all([
      this.workoutRepo.getCompletedWorkoutIds(ids),
      this.workoutRepo.getCompletionDataForWorkouts(ids),
    ]);
    return history.map((w) => {
      const data = completionData.get(w.id);
      return {
        id: w.id,
        date: w.date.toISOString(),
        type: w.type,
        durationMinutes: w.durationMinutes,
        ...w.spec,
        completed: completedIds.has(w.id),
        completionTime: data?.completionTime,
        roundsOrReps: data?.roundsOrReps,
      };
    });
  }
}

export class CompleteWorkoutUseCase {
  constructor(private workoutRepo: WorkoutRepository) {}

  async execute(userId: string, input: CompleteWorkoutRequestDTO): Promise<void> {
    const workout = await this.workoutRepo.findById(input.workoutId);
    if (!workout || workout.userId !== userId) {
      const error: any = new Error("Workout not found");
      error.statusCode = 404;
      throw error;
    }
    if (input.spec) {
      await this.workoutRepo.updateSpec(input.workoutId, input.spec);
    }
    await this.workoutRepo.recordCompletion({
      workoutId: input.workoutId,
      data: {
        completionTime: input.completionTime,
        roundsOrReps: input.roundsOrReps,
      },
    });
  }
}

