import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import {
    workoutResponseSchema,
    paginatedHistorySchema,
} from "./api";
import type {
    WorkoutResponse,
    CompleteWorkoutPayload,
    PaginatedHistoryResponse,
} from "./api";

export function useGenerateWorkout() {
    const queryClient = useQueryClient();
    return useMutation<
        WorkoutResponse,
        Error,
        {
            category: "sprint" | "metcon" | "long";
            equipment: string[];
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

/**
 * Fetch first page of workout history (used by TodayWodPage).
 * Returns only the data array for backwards compat.
 */
export function useWorkoutHistory() {
    return useQuery<WorkoutResponse[]>({
        queryKey: ["workouts", "history"],
        queryFn: async () => {
            const res = await apiClient.get("/workouts/history", {
                params: { limit: 20 },
            });
            const parsed = paginatedHistorySchema.parse(res.data);
            return parsed.data;
        },
    });
}

/**
 * Infinite-scroll workout history (used by HistoryPage).
 * Uses cursor-based pagination with TanStack useInfiniteQuery.
 */
export function useWorkoutHistoryInfinite(pageSize = 20) {
    return useInfiniteQuery<PaginatedHistoryResponse, Error>({
        queryKey: ["workouts", "history", "infinite"],
        queryFn: async ({ pageParam }) => {
            const params: Record<string, string | number> = { limit: pageSize };
            if (pageParam) params.cursor = pageParam as string;
            const res = await apiClient.get("/workouts/history", { params });
            return paginatedHistorySchema.parse(res.data);
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
}

export function useClearWorkoutHistory() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, void>({
        mutationFn: async () => {
            await apiClient.delete("/workouts/history", {
                data: { confirm: "DELETE_ALL_HISTORY" },
            });
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

export function useDeleteWorkout() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: async (workoutId) => {
            await apiClient.delete(`/workouts/${workoutId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workouts"] });
        },
    });
}
