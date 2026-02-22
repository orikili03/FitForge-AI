import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateWorkout } from "../features/workouts/workoutApi";
import { useEquipmentState } from "../features/equipment/equipmentApi";
import { WodDetailCard, ScalingOptionsBlock } from "../components/wod";
import { applyScaling } from "../utils/applyScaling";
import {
  BUILTIN_PRESETS,
  EQUIPMENT_CATALOG,
  type EquipmentCategory,
} from "../features/equipment/equipmentCatalog";

const CATEGORY_ORDER: EquipmentCategory[] = ["Gymnastics", "Strength", "Conditioning", "Optional"];

function catalogByCategory() {
  const map = new Map<EquipmentCategory, typeof EQUIPMENT_CATALOG>();
  for (const item of EQUIPMENT_CATALOG) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }
  return CATEGORY_ORDER.map((cat) => ({ category: cat, items: map.get(cat) ?? [] }));
}

const DURATION_OPTIONS = [
  { id: "quick" as const, label: "Quick", note: "Up to 20 min" },
  { id: "medium" as const, label: "Medium", note: "Up to 45 min" },
  { id: "full" as const, label: "Full length", note: "An hour workout" },
] as const;

const DURATION_TO_MINUTES: Record<"quick" | "medium" | "full", number> = {
  quick: 20,
  medium: 45,
  full: 60,
};

const PROTOCOL_OPTIONS: { value: string; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "EMOM", label: "EMOM" },
  { value: "AMRAP", label: "AMRAP" },
  { value: "FOR_TIME", label: "FOR TIME" },
  { value: "TABATA", label: "TABATA" },
  { value: "DEATH_BY", label: "Death By" },
  { value: "21_15_9", label: "21; 15; 9" },
];

interface FormValues {
  duration: "quick" | "medium" | "full";
  presetId: string;
  protocol: string;
}

export function GenerateWorkoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const equipmentQuery = useEquipmentState();
  const customPresets = equipmentQuery.data?.customPresets ?? [];

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      duration: "quick",
      presetId: "none",
      protocol: "recommended",
    },
  });
  const generateMutation = useGenerateWorkout();
  const selectedPresetId = watch("presetId");
  const selectedDuration = watch("duration");
  const [includedGearIds, setIncludedGearIds] = useState<Set<string>>(new Set());
  const [customGearWeights, setCustomGearWeights] = useState<
    Record<string, { minWeight?: number; maxWeight?: number }>
  >({});
  const [selectedScaling, setSelectedScaling] = useState<string[]>([]);

  const currentGearIdsKey = useMemo(() => {
    const builtin = BUILTIN_PRESETS.find((p) => p.id === selectedPresetId);
    const custom = customPresets.find((p) => p.id === selectedPresetId);
    const selected = builtin?.selected ?? custom?.selected ?? [];
    return selected.map((s) => s.id).sort().join(",");
  }, [selectedPresetId, customPresets]);

  useEffect(() => {
    const builtin = BUILTIN_PRESETS.find((p) => p.id === selectedPresetId);
    const custom = customPresets.find((p) => p.id === selectedPresetId);
    const selected = builtin?.selected ?? custom?.selected ?? [];
    setIncludedGearIds(new Set(selected.map((s) => s.id)));
    if (selectedPresetId !== "custom") setCustomGearWeights({});
  }, [selectedPresetId, customPresets]);

  const toggleGear = (id: string) => {
    setIncludedGearIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setCustomGearWeights((w) => {
          const copy = { ...w };
          delete copy[id];
          return copy;
        });
      } else next.add(id);
      return next;
    });
  };

  const setCustomGearWeight = (
    id: string,
    field: "minWeight" | "maxWeight",
    value: number | undefined
  ) => {
    setCustomGearWeights((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value === undefined || Number.isNaN(value) ? undefined : value },
    }));
  };

  const getPresetName = (presetId: string): string | undefined => {
    const builtin = BUILTIN_PRESETS.find((p) => p.id === presetId);
    if (builtin && builtin.id !== "custom") return builtin.name;
    const custom = customPresets.find((p) => p.id === presetId);
    return custom?.name;
  };

  const onSubmit = (values: FormValues) => {
    generateMutation.mutate(
      {
        timeCapMinutes: DURATION_TO_MINUTES[values.duration],
        equipment: Array.from(includedGearIds),
        protocol: values.protocol,
        presetName: getPresetName(values.presetId),
      },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({ queryKey: ["workouts", "history"] });
          navigate("/");
        },
      }
    );
  };

  const wod = generateMutation.data;

  useEffect(() => {
    if (wod?.id) setSelectedScaling([]);
  }, [wod?.id]);

  const displayWod = useMemo(() => {
    if (!wod?.wod) return wod?.wod;
    return applyScaling(wod.wod, selectedScaling);
  }, [wod?.wod, selectedScaling]);

  const currentGear = useMemo(() => {
    const builtin = BUILTIN_PRESETS.find((p) => p.id === selectedPresetId);
    const custom = customPresets.find((p) => p.id === selectedPresetId);
    const selected = builtin?.selected ?? custom?.selected ?? [];
    return selected.map((s) => {
      const catalog = EQUIPMENT_CATALOG.find((c) => c.id === s.id);
      return {
        id: s.id,
        label: catalog?.label ?? s.id,
        minWeight: s.minWeight,
        maxWeight: s.maxWeight,
      };
    });
  }, [selectedPresetId, customPresets]);

  const builtinWithoutCustom = BUILTIN_PRESETS.filter((p) => p.id !== "custom");
  const customBuiltin = BUILTIN_PRESETS.find((p) => p.id === "custom");
  const toOpt = (p: { id: string; name: string; description: string; selected: unknown[] }) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    count: p.selected.length,
  });
  const equipmentOptions = [
    ...builtinWithoutCustom.map(toOpt),
    ...customPresets.map((p) => ({ id: p.id, name: p.name, description: `${p.selected.length} items`, count: p.selected.length })),
    ...(customBuiltin ? [toOpt(customBuiltin)] : []),
  ];

  const isNoEquipment = selectedPresetId === "none";
  const isCustomPresetOption = selectedPresetId === "custom";
  const showAvailableGearBelow = !isNoEquipment && !isCustomPresetOption && currentGear.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ds-text">Generate Workout</h1>
        <p className="text-sm text-ds-text-muted">
          WODLab uses your context to design a CrossFit-style WOD with appropriate intensity and scaling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr,1.8fr] gap-6">
        <div className="card min-w-0 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
            <div>
              <label className="block mb-2">Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((opt) => {
                  const selected = selectedDuration === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setValue("duration", opt.id)}
                      className={[
                        "min-w-0 rounded-xl border px-3 py-2.5 text-center transition-all duration-150 active:scale-[0.99] overflow-hidden",
                        selected
                          ? "border-amber-500/60 bg-ds-surface shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
                          : "border-ds-border bg-ds-surface-subtle hover:border-ds-border-strong",
                      ].join(" ")}
                    >
                      <div className="text-sm font-medium text-ds-text truncate">{opt.label}</div>
                      <div className="text-xs text-ds-text-muted mt-0.5 truncate">{opt.note}</div>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...register("duration")} />
            </div>
            <div>
              <label className="block mb-2">Equipment</label>
              <div className="grid grid-cols-2 min-[500px]:grid-cols-3 gap-2">
                {equipmentOptions.map((opt) => {
                  const selected = selectedPresetId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setValue("presetId", opt.id)}
                      className={[
                        "min-w-0 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 active:scale-[0.99] overflow-hidden",
                        selected
                          ? "border-amber-500/60 bg-ds-surface shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
                          : "border-ds-border bg-ds-surface-subtle hover:border-ds-border-strong",
                      ].join(" ")}
                    >
                      <div className="text-sm font-medium text-ds-text truncate">{opt.name}</div>
                      <div className="text-xs text-ds-text-muted mt-0.5 line-clamp-2 break-words">{opt.description}</div>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...register("presetId")} />
              {showAvailableGearBelow && (
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-ds-text-muted mb-2">Available gear</h3>
                  <ul className="space-y-2">
                    {currentGear.map((g) => {
                      const checked = includedGearIds.has(g.id);
                      const hasWeight = g.minWeight !== undefined || g.maxWeight !== undefined;
                      return (
                        <li key={g.id}>
                          <label className="grid cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-ds-border bg-ds-surface-subtle px-3 py-2 text-left hover:border-ds-border-strong">
                            <span className={`min-w-0 font-medium text-sm truncate ${checked ? "text-ds-text" : "text-ds-text-muted"}`}>
                              {g.label}
                            </span>
                            {hasWeight ? (
                              <span className="shrink-0 text-xs text-ds-text-muted">
                                {g.minWeight ?? "?"}–{g.maxWeight ?? "?"} kg
                              </span>
                            ) : (
                              <span />
                            )}
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleGear(g.id)}
                              className="h-4 w-4 shrink-0 rounded border-ds-border text-amber-600 focus:ring-amber-500"
                            />
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {isCustomPresetOption && (
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-ds-text-muted mb-2">
                    Choose gear for this workout
                  </h3>
                  <div className="space-y-3">
                    {catalogByCategory().map(
                      ({ category, items }) =>
                        items.length > 0 && (
                          <div key={category}>
                            <div className="text-xs font-medium text-ds-text-muted mb-1.5">
                              {category}
                            </div>
                            <ul className="space-y-1.5">
                              {items.map((item) => {
                                const checked = includedGearIds.has(item.id);
                                const weights = customGearWeights[item.id];
                                return (
                                  <li key={item.id}>
                                    <div className="rounded-lg border border-ds-border bg-ds-surface-subtle px-3 py-2">
                                      <label className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 text-left">
                                        <span
                                          className={`min-w-0 font-medium text-sm truncate ${checked ? "text-ds-text" : "text-ds-text-muted"}`}
                                        >
                                          {item.label}
                                        </span>
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleGear(item.id)}
                                          className="h-4 w-4 shrink-0 rounded border-ds-border text-amber-600 focus:ring-amber-500"
                                        />
                                      </label>
                                      {item.weightDependent && checked && (
                                        <div className="mt-2 flex items-center gap-2 pl-0">
                                          <label className="flex items-center gap-1.5 text-xs text-ds-text-muted">
                                            <span>Min</span>
                                            <input
                                              type="number"
                                              min={0}
                                              step={1}
                                              placeholder="kg"
                                              className="w-14 rounded border border-ds-border bg-ds-bg px-2 py-1 text-ds-text"
                                              value={weights?.minWeight ?? ""}
                                              onChange={(e) =>
                                                setCustomGearWeight(
                                                  item.id,
                                                  "minWeight",
                                                  e.target.value === "" ? undefined : Number(e.target.value)
                                                )
                                              }
                                            />
                                          </label>
                                          <label className="flex items-center gap-1.5 text-xs text-ds-text-muted">
                                            <span>Max</span>
                                            <input
                                              type="number"
                                              min={0}
                                              step={1}
                                              placeholder="kg"
                                              className="w-14 rounded border border-ds-border bg-ds-bg px-2 py-1 text-ds-text"
                                              value={weights?.maxWeight ?? ""}
                                              onChange={(e) =>
                                                setCustomGearWeight(
                                                  item.id,
                                                  "maxWeight",
                                                  e.target.value === "" ? undefined : Number(e.target.value)
                                                )
                                              }
                                            />
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2">Protocol</label>
              <select
                className="w-full rounded-[20px] border border-ds-border bg-ds-surface-subtle text-ds-text px-3 py-2"
                {...register("protocol")}
              >
                {PROTOCOL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? "Generating..." : "Generate WOD"}
            </button>
            {generateMutation.isError && (
              <p className="text-xs text-red-400 mt-2">
                {(generateMutation.error as any).message ?? "Unable to generate workout"}
              </p>
            )}
          </form>
        </div>

        <div className="min-w-0 overflow-hidden space-y-4">
          {!wod ? (
            <div className="card">
              <p className="text-sm text-ds-text-muted break-words">
                Choose equipment above, then generate a WOD to see the workout here.
              </p>
            </div>
          ) : (
            <>
              {wod.warmup && wod.warmup.length > 0 && (
                <div className="rounded-ds-lg border border-ds-border bg-ds-surface-subtle p-ds-4">
                  <p className="text-xs uppercase tracking-wider text-ds-text-muted font-medium mb-2">Warm-up</p>
                  <ul className="space-y-1 text-sm text-ds-text">
                    {wod.warmup.map((s) => (
                      <li key={s} className="flex items-baseline gap-2">
                        <span className="text-ds-text-muted">·</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <WodDetailCard
                wod={displayWod ?? wod.wod}
                equipmentPresetName={wod.equipmentPresetName}
              >
                <div className="space-y-3 text-sm">
                  {wod.stimulusNote && (
                    <p className="text-ds-text-muted italic text-sm">{wod.stimulusNote}</p>
                  )}
                  {wod.scalingOptions.length > 0 && (
                    <ScalingOptionsBlock
                      scalingOptions={wod.scalingOptions}
                      selectedLabels={selectedScaling}
                      onSelectionChange={setSelectedScaling}
                    />
                  )}
                </div>
              </WodDetailCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

