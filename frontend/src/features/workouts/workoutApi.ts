import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";

export interface MovementItemSpec {
  reps: number;
  name: string;
  weight?: string;
  distance?: string;
}

export interface WorkoutSpec {
  warmup: string[];
  wod: {
    type: string;
    duration: number;
    description: string;
    movements: string[];
    rounds?: number;
    movementItems?: MovementItemSpec[];
  };
  scalingOptions: string[];
  finisher?: string[];
  intensityGuidance: string;
  intendedStimulus?: string;
  timeDomain?: string;
  movementEmphasis?: string[];
  stimulusNote?: string;
}

export interface WorkoutResponse extends WorkoutSpec {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  completed?: boolean;
  timeDomain?: string;
}

export interface CompleteWorkoutPayload {
  workoutId: string;
  completionTime?: number;
  roundsOrReps?: number;
}

export function useGenerateWorkout() {
  return useMutation<
    WorkoutResponse,
    Error,
    { timeCapMinutes: number; equipment: string[]; goal: "strength" | "endurance" | "mixed" | "skill"; protocol: string }
  >({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/workouts/generate", payload);
      return res.data.data;
    },
  });
}

export function useWorkoutHistory() {
  return useQuery<WorkoutResponse[]>({
    queryKey: ["workouts", "history"],
    queryFn: async () => {
      const res = await apiClient.get("/workouts/history");
      return res.data.data;
    },
  });
}

export function useCompleteWorkout() {
  return useMutation<void, Error, CompleteWorkoutPayload>({
    mutationFn: async (payload) => {
      await apiClient.post("/workouts/complete", payload);
    },
  });
}

