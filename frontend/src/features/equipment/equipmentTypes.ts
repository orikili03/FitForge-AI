import { z } from "zod";

export const equipmentSelectionSchema = z
  .object({
    id: z.string().min(1),
    minWeight: z.number().nonnegative().optional(),
    maxWeight: z.number().nonnegative().optional(),
  })
  .refine(
    (v) =>
      v.minWeight === undefined ||
      v.maxWeight === undefined ||
      v.minWeight <= v.maxWeight,
    { message: "minWeight must be <= maxWeight", path: ["minWeight"] }
  );

export const customPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  selected: z.array(equipmentSelectionSchema),
});

export const equipmentStateSchema = z.object({
  selected: z.array(equipmentSelectionSchema),
  customPresets: z.array(customPresetSchema),
});

export type EquipmentSelection = z.infer<typeof equipmentSelectionSchema>;
export type CustomPreset = z.infer<typeof customPresetSchema>;
export type EquipmentState = z.infer<typeof equipmentStateSchema>;

