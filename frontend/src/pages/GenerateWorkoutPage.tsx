import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useGenerateWorkout } from "../features/workouts/workoutApi";
import { useEquipmentState } from "../features/equipment/equipmentApi";
import { BUILTIN_PRESETS, EQUIPMENT_CATALOG } from "../features/equipment/equipmentCatalog";

interface FormValues {
  timeCapMinutes: number;
  goal: "strength" | "endurance" | "mixed" | "skill";
  presetId: string;
}

export function GenerateWorkoutPage() {
  const equipmentQuery = useEquipmentState();
  const customPresets = equipmentQuery.data?.customPresets ?? [];

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      timeCapMinutes: 20,
      goal: "mixed",
      presetId: "none",
    },
  });
  const generateMutation = useGenerateWorkout();
  const selectedPresetId = watch("presetId");
  const [includedGearIds, setIncludedGearIds] = useState<Set<string>>(new Set());

  const currentGearIdsKey = useMemo(() => {
    const builtin = BUILTIN_PRESETS.find((p) => p.id === selectedPresetId);
    const custom = customPresets.find((p) => p.id === selectedPresetId);
    const selected = builtin?.selected ?? custom?.selected ?? [];
    return selected.map((s) => s.id).join(",");
  }, [selectedPresetId, customPresets]);

  useEffect(() => {
    const builtin = BUILTIN_PRESETS.find((p) => p.id === selectedPresetId);
    const custom = customPresets.find((p) => p.id === selectedPresetId);
    const selected = builtin?.selected ?? custom?.selected ?? [];
    setIncludedGearIds(new Set(selected.map((s) => s.id)));
  }, [currentGearIdsKey]);

  const toggleGear = (id: string) => {
    setIncludedGearIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSubmit = (values: FormValues) => {
    generateMutation.mutate({
      timeCapMinutes: Number(values.timeCapMinutes),
      equipment: Array.from(includedGearIds),
      goal: values.goal,
    });
  };

  const wod = generateMutation.data;

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

  const equipmentOptions = [
    ...BUILTIN_PRESETS.map((p) => ({ id: p.id, name: p.name, description: p.description, count: p.selected.length })),
    ...customPresets.map((p) => ({ id: p.id, name: p.name, description: `${p.selected.length} items`, count: p.selected.length })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ds-text">Generate Workout</h1>
        <p className="text-sm text-ds-text-muted">
          FitForge AI uses your context to design a CrossFit-style WOD with appropriate intensity and scaling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr,1.8fr] gap-6">
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
            <div>
              <label className="block mb-1">Time cap (minutes)</label>
              <input
                type="number"
                className="w-full rounded-[20px] border border-ds-border bg-ds-surface-subtle text-ds-text px-3 py-2"
                {...register("timeCapMinutes", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="block mb-2">Equipment</label>
              <input type="hidden" {...register("presetId")} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {equipmentOptions.map((opt) => {
                  const selected = selectedPresetId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setValue("presetId", opt.id)}
                      className={[
                        "rounded-xl border px-4 py-3 text-left transition-all duration-150 active:scale-[0.99]",
                        selected
                          ? "border-amber-500/60 bg-ds-surface shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
                          : "border-ds-border bg-ds-surface-subtle hover:border-ds-border-strong",
                      ].join(" ")}
                    >
                      <div className="text-sm font-medium text-ds-text">{opt.name}</div>
                      <div className="text-xs text-ds-text-muted mt-0.5">{opt.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block mb-1">Primary goal</label>
              <select
                className="w-full rounded-[20px] border border-ds-border bg-ds-surface-subtle text-ds-text px-3 py-2"
                {...register("goal")}
              >
                <option value="mixed">Mixed</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="skill">Skill</option>
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

        <div className="card">
          <h2 className="text-sm font-semibold mb-2">{wod ? "Workout blueprint" : "Available gear"}</h2>
          {!wod ? (
            <div className="text-sm">
              <p className="text-ds-text-muted mb-3">
                Gear for the chosen template. Generate a WOD to see the workout blueprint here.
              </p>
              {currentGear.length === 0 ? (
                <p className="text-ds-text-muted">No equipment — bodyweight only.</p>
              ) : (
                <ul className="space-y-2">
                  {currentGear.map((g) => {
                    const checked = includedGearIds.has(g.id);
                    const hasWeight = g.minWeight !== undefined || g.maxWeight !== undefined;
                    return (
                      <li key={g.id}>
                        <label className="grid cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-ds-border bg-ds-surface-subtle px-3 py-2 text-left hover:border-ds-border-strong">
                          <span className={`min-w-0 font-medium ${checked ? "text-ds-text" : "text-ds-text-muted"}`}>
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
              )}
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium">
                  {wod.wod.type} • {wod.wod.duration} min
                </div>
                <p className="text-ds-text-muted mt-1">{wod.wod.description}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-ds-text-muted mb-1">
                  Warm-up
                </h3>
                <ul className="list-disc list-inside">
                  {wod.warmup.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-ds-text-muted mb-1">
                  Movements
                </h3>
                <ul className="list-disc list-inside">
                  {wod.wod.movements.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-ds-text-muted mb-1">
                  Scaling
                </h3>
                <ul className="list-disc list-inside">
                  {wod.scalingOptions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-ds-text-muted mb-1">
                  Intensity
                </h3>
                <p>{wod.intensityGuidance}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

