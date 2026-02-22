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
    duration?: number;
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
  equipmentPresetName?: string;
  equipmentUsed?: string[];
}

export interface WorkoutResponse extends WorkoutSpec {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  completed?: boolean;
  completionTime?: number;
  roundsOrReps?: number;
  timeDomain?: string;
}

export interface CompleteWorkoutPayload {
  workoutId: string;
  completionTime?: number;
  roundsOrReps?: number;
  /** Scaled spec as performed; when sent, history will show this version. */
  spec?: WorkoutSpec;
}

export function useGenerateWorkout() {
  return useMutation<
    WorkoutResponse,
    Error,
    { timeCapMinutes: number; equipment: string[]; protocol: string; injuries?: string; presetName?: string }
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
      // #region agent log
      fetch('http://127.0.0.1:7802/ingest/54cb5655-457e-439c-a4ef-8625152ae87b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '65fbc5' }, body: JSON.stringify({ sessionId: '65fbc5', location: 'workoutApi.ts:complete', message: 'complete payload before POST', data: { workoutId: payload.workoutId, completionTime: payload.completionTime, hasSpec: !!payload.spec }, hypothesisId: 'H3_H5', timestamp: Date.now() }) }).catch(() => {});
      // #endregion
      try {
        await apiClient.post("/workouts/complete", payload);
      } catch (err: unknown) {
        // #region agent log
        fetch('http://127.0.0.1:7802/ingest/54cb5655-457e-439c-a4ef-8625152ae87b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '65fbc5' }, body: JSON.stringify({ sessionId: '65fbc5', location: 'workoutApi.ts:complete', message: 'complete POST failed', data: { error: String(err), status: (err as { response?: { status?: number } })?.response?.status }, hypothesisId: 'H3_H5', timestamp: Date.now() }) }).catch(() => {});
        // #endregion
        throw err;
      }
    },
  });
}

