import { z } from "zod";

const equipmentSelectionSchema = z
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
    {
      message: "minWeight must be <= maxWeight",
      path: ["minWeight"],
    }
  );

const customPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  selected: z.array(equipmentSelectionSchema),
});

export const updateEquipmentSchema = z.object({
  selected: z.array(equipmentSelectionSchema),
  customPresets: z.array(customPresetSchema).max(50),
});

