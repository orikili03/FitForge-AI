import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import {
    equipmentStateSchema,
} from "./api";
import type {
    EquipmentState,
} from "./api";

const DEFAULT_EQUIPMENT: EquipmentState = { selected: [], customPresets: [] };

interface MeResponse {
    data: {
        equipment?: EquipmentState;
    };
}

export function useEquipmentState() {
    const query = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await apiClient.get<MeResponse>("/users/me");
            return res.data.data;
        },
    });

    const data = useMemo(() => {
        // If query hasn't finished, data should be undefined to signal 'loading'
        if (query.isLoading || !query.data) return undefined;

        if (!query.data.equipment) return DEFAULT_EQUIPMENT;
        try {
            return equipmentStateSchema.parse(query.data.equipment);
        } catch (e) {
            console.error("Failed to parse equipment state", e);
            return DEFAULT_EQUIPMENT;
        }
    }, [query.data, query.isLoading]);

    return {
        ...query,
        data,
    };
}

export function useUpdateEquipment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: EquipmentState) => {
            const res = await apiClient.put("/users/me/equipment", payload);
            return res.data.data as { equipment: EquipmentState };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
}
