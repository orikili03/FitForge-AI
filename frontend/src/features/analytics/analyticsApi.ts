import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";

interface ProgressPoint {
  date: string;
  rpe: number;
  roundsOrReps: number | null;
}

interface ProgressResponse {
  totalSessions: number;
  averageRpe: number;
  points: ProgressPoint[];
}

export function useProgressAnalytics() {
  return useQuery<ProgressResponse>({
    queryKey: ["analytics", "progress"],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/progress");
      return res.data.data;
    },
  });
}

