import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { todayWodSchema } from './api';
import type { TodayWod } from './api';

/**
 * Hook to fetch today's WOD.
 * Returns the data, loading state and any error.
 */
export function useTodayWod() {
    return useQuery<TodayWod, Error>({
        queryKey: ['todayWod'],
        queryFn: async () => {
            const response = await apiClient.get('/wod/today');
            // Validate response shape with Zod
            return todayWodSchema.parse(response.data);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes – matches V1 caching behaviour
        retry: 1,
    });
}
