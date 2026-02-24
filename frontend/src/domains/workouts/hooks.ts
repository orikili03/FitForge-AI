import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import {
    workoutResponseSchema,
} from "./api";
import type {
    WorkoutResponse,
    CompleteWorkoutPayload,
} from "./api";
import { z } from "zod";

export function useGenerateWorkout() {
    const queryClient = useQueryClient();
    return useMutation<
        WorkoutResponse,
        Error,
        {
            timeCapMinutes: number;
            equipment: string[];
            protocol: string;
            injuries?: string;
            presetName?: string;
        }
    >({
        mutationFn: async (payload) => {
            const res = await apiClient.post("/workouts/generate", payload);
            return workoutResponseSchema.parse(res.data.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workouts"] });
        },
    });
}

export function useWorkoutHistory() {
    return useQuery<WorkoutResponse[]>({
        queryKey: ["workouts", "history"],
        queryFn: async () => {
            const res = await apiClient.get("/workouts/history");
            return z.array(workoutResponseSchema).parse(res.data.data);
        },
    });
}

export function useClearWorkoutHistory() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, void>({
        mutationFn: async () => {
            await apiClient.delete("/workouts/history");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workouts"] });
        },
    });
}

export function useCompleteWorkout() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, CompleteWorkoutPayload>({
        mutationFn: async (payload) => {
            await apiClient.post("/workouts/complete", payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workouts"] });
        },
    });
}
