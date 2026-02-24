import { z } from "zod";

export const equipmentSelectionSchema = z.object({
    id: z.string(),
    minWeight: z.number().optional(),
    maxWeight: z.number().optional(),
});

export const customPresetSchema = z.object({
    id: z.string(),
    name: z.string(),
    selected: z.array(equipmentSelectionSchema),
});

export const equipmentStateSchema = z.object({
    selected: z.array(equipmentSelectionSchema),
    customPresets: z.array(customPresetSchema),
});

export type EquipmentSelection = z.infer<typeof equipmentSelectionSchema>;
export type CustomPreset = z.infer<typeof customPresetSchema>;
export type EquipmentState = z.infer<typeof equipmentStateSchema>;
