import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";
import { equipmentStateSchema, EquipmentState } from "./equipmentTypes";

export function useEquipmentState() {
  return useQuery<EquipmentState>({
    queryKey: ["me", "equipment"],
    queryFn: async () => {
      const res = await apiClient.get("/users/me");
      const raw = res.data.data?.equipment;
      const state = raw ?? { selected: [], customPresets: [] };
      return equipmentStateSchema.parse(state);
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation<
    EquipmentState,
    Error,
    EquipmentState
  >({
    mutationFn: async (payload) => {
      const parsed = equipmentStateSchema.parse(payload);
      const res = await apiClient.put("/users/me/equipment", parsed);
      const raw = res.data.data?.equipment ?? { selected: [], customPresets: [] };
      return equipmentStateSchema.parse(raw);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "equipment"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

