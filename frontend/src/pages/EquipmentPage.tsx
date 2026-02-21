import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";

import { useEquipmentState, useUpdateEquipment } from "../features/equipment/equipmentApi";
import { BUILTIN_PRESETS, EQUIPMENT_CATALOG, EquipmentCategory } from "../features/equipment/equipmentCatalog";
import { CustomPreset, EquipmentSelection, EquipmentState } from "../features/equipment/equipmentTypes";

function byCategory(category: EquipmentCategory) {
  return EQUIPMENT_CATALOG.filter((e) => e.category === category);
}

function isWeightDependent(id: string) {
  return EQUIPMENT_CATALOG.find((e) => e.id === id)?.weightDependent ?? false;
}

function capitalizeEachWord(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(" ");
}

function EquipmentCard({
  id,
  label,
  Icon,
  active,
  weightDependent,
  minWeight,
  maxWeight,
  onToggle,
  onChangeWeights,
  weightError,
}: {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  weightDependent?: boolean;
  minWeight?: number;
  maxWeight?: number;
  weightError?: string | null;
  onToggle: () => void;
  onChangeWeights: (next: { minWeight?: number; maxWeight?: number }) => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "w-full text-left rounded-xl border transition-all duration-150",
        "px-4 py-4 bg-ds-surface-subtle",
        "active:scale-[0.99]",
        active ? "border-amber-500/60 bg-ds-surface shadow-[0_0_0_1px_rgba(245,158,11,0.25)]" : "border-ds-border hover:border-ds-border-strong",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "h-10 w-10 rounded-lg flex items-center justify-center border transition-colors",
            active ? "bg-amber-500/10 border-amber-500/30" : "bg-ds-surface border-ds-border",
          ].join(" ")}
        >
          <Icon className={active ? "text-amber-600" : "text-ds-text-muted"} />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-ds-text-muted">{active ? "Selected" : "Tap to select"}</div>
        </div>
        <div
          className={[
            "text-xs px-2 py-1 rounded-md border",
            active ? "border-amber-500/40 text-amber-600" : "border-ds-border text-ds-text-muted",
          ].join(" ")}
        >
          {active ? "On" : "Off"}
        </div>
      </div>

      {active && weightDependent && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-ds-text-muted mb-1">Min</label>
            <input
              type="number"
              inputMode="decimal"
              value={minWeight ?? ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChangeWeights({ minWeight: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="w-full rounded-md bg-ds-surface-subtle border border-ds-border px-2 py-1"
              placeholder="kg"
            />
          </div>
          <div>
            <label className="block text-ds-text-muted mb-1">Max</label>
            <input
              type="number"
              inputMode="decimal"
              value={maxWeight ?? ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChangeWeights({ maxWeight: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="w-full rounded-md bg-ds-surface-subtle border border-ds-border px-2 py-1"
              placeholder="kg"
            />
          </div>
          {weightError && <div className="col-span-2 text-[11px] text-red-500">{weightError}</div>}
        </div>
      )}
    </button>
  );
}

export function EquipmentPage() {
  const { data, isLoading } = useEquipmentState();
  const updateMutation = useUpdateEquipment();

  const [local, setLocal] = useState<EquipmentState>({ selected: [], customPresets: [] });
  const [activeCustomPresetId, setActiveCustomPresetId] = useState<string | null>(null);
  const [showCreatePreset, setShowCreatePreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [presetToRemove, setPresetToRemove] = useState<{ id: string; name: string } | null>(null);
  const [hasChosenPreset, setHasChosenPreset] = useState(false);
  const [presetNameError, setPresetNameError] = useState<string | null>(null);
  const initialSyncDone = useRef(false);

  useEffect(() => {
    if (data) {
      setLocal(data);
      initialSyncDone.current = true;
    }
  }, [data]);

  const weightErrors = useMemo(() => {
    const errors: Record<string, string | null> = {};
    for (const s of local.selected) {
      if (!isWeightDependent(s.id)) continue;
      if (s.minWeight !== undefined && s.maxWeight !== undefined && s.minWeight > s.maxWeight) {
        errors[s.id] = "Min must be ≤ Max";
      } else {
        errors[s.id] = null;
      }
    }
    return errors;
  }, [local.selected]);

  const hasAnyWeightError = Object.values(weightErrors).some((v) => v);

  useEffect(() => {
    if (!initialSyncDone.current || !data) return;
    const timer = setTimeout(() => {
      if (!hasAnyWeightError) updateMutation.mutate(local);
    }, 600);
    return () => clearTimeout(timer);
  }, [local, hasAnyWeightError, data]);

  const selectedIds = useMemo(() => new Set(local.selected.map((s) => s.id)), [local.selected]);

  const toggle = (id: string) => {
    setLocal((prev) => {
      const exists = prev.selected.find((s) => s.id === id);
      const nextSelected = exists
        ? prev.selected.filter((s) => s.id !== id)
        : [...prev.selected, { id }];
      const nextPresets = activeCustomPresetId
        ? prev.customPresets.map((p) =>
            p.id === activeCustomPresetId ? { ...p, selected: nextSelected } : p
          )
        : prev.customPresets;
      return { ...prev, selected: nextSelected, customPresets: nextPresets };
    });
  };

  const changeWeights = (id: string, next: { minWeight?: number; maxWeight?: number }) => {
    setLocal((prev) => {
      const nextSelected = prev.selected.map((s) => (s.id === id ? { ...s, ...next } : s));
      const nextPresets = activeCustomPresetId
        ? prev.customPresets.map((p) =>
            p.id === activeCustomPresetId ? { ...p, selected: nextSelected } : p
          )
        : prev.customPresets;
      return { ...prev, selected: nextSelected, customPresets: nextPresets };
    });
  };

  const applyPreset = (selected: EquipmentSelection[], customPresetId?: string) => {
    setShowCreatePreset(false);
    setNewPresetName("");
    setHasChosenPreset(true);
    setLocal((prev) => ({ ...prev, selected }));
    setActiveCustomPresetId(customPresetId ?? null);
  };

  const removeCustomPreset = (id: string) => {
    setLocal((prev) => ({ ...prev, customPresets: prev.customPresets.filter((p) => p.id !== id) }));
    if (activeCustomPresetId === id) setActiveCustomPresetId(null);
  };

  const existingPresetNames = useMemo(() => {
    const builtin = new Set(BUILTIN_PRESETS.map((p) => p.name.toLowerCase()));
    const custom = new Set(local.customPresets.map((p) => p.name.toLowerCase()));
    return (name: string) => builtin.has(name.toLowerCase()) || custom.has(name.toLowerCase());
  }, [local.customPresets]);

  const createNewPreset = () => {
    const raw = newPresetName.trim();
    if (!raw) return;
    const name = capitalizeEachWord(raw);
    if (existingPresetNames(name)) {
      setPresetNameError("A preset with this name already exists.");
      return;
    }
    setPresetNameError(null);
    const id = `preset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const preset: CustomPreset = { id, name, selected: [] };
    setHasChosenPreset(true);
    setLocal((prev) => ({ ...prev, customPresets: [...prev.customPresets, preset], selected: [] }));
    setActiveCustomPresetId(id);
    setNewPresetName("");
    setShowCreatePreset(false);
  };

  const selectionKey = (selected: EquipmentSelection[]) =>
    selected
      .map((s) => `${s.id}:${s.minWeight ?? ""}:${s.maxWeight ?? ""}`)
      .sort()
      .join(",");
  const currentKey = selectionKey(local.selected);
  const isPresetActive = (presetSelected: EquipmentSelection[]) =>
    selectionKey(presetSelected) === currentKey;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Equipment</h1>
        <p className="text-sm text-ds-text-muted">
          Create and edit equipment presets here. Use them in Generate to choose which gear to include when generating a workout. Changes save automatically.
        </p>
        {updateMutation.isPending && (
          <p className="text-xs text-ds-text-muted mt-1">Saving…</p>
        )}
      </div>

      <div className={!showCreatePreset && hasChosenPreset ? "grid grid-cols-1 lg:grid-cols-[1.4fr,0.6fr] gap-6" : ""}>
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Presets</div>
                <div className="text-xs text-ds-text-muted">One-tap configurations + your custom presets.</div>
              </div>
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {BUILTIN_PRESETS.filter((p) => p.id !== "none" && p.id !== "custom").map((p) => {
                const active = hasChosenPreset && isPresetActive(p.selected) && activeCustomPresetId === null;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.selected)}
                    className={[
                      "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-amber-500/60 bg-ds-surface shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
                        : "border-ds-border bg-ds-surface-subtle hover:border-ds-border-strong",
                    ].join(" ")}
                  >
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-ds-text-muted">{p.description}</div>
                  </button>
                );
              })}
              {local.customPresets.map((p) => {
                const active = hasChosenPreset && isPresetActive(p.selected) && activeCustomPresetId === p.id;
                return (
                  <div
                    key={p.id}
                    className={[
                      "flex items-start gap-2 rounded-xl border px-4 py-3 transition-colors",
                      active
                        ? "border-amber-500/60 bg-ds-surface shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
                        : "border-ds-border bg-ds-surface-subtle hover:border-ds-border-strong",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => applyPreset(p.selected, p.id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-ds-text-muted">{p.selected.length} items</div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPresetToRemove({ id: p.id, name: p.name });
                      }}
                      className="shrink-0 p-1.5 rounded text-ds-text-muted hover:text-red-500 transition-colors"
                      title="Remove preset"
                      aria-label="Remove preset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              {(() => {
                const customBuiltin = BUILTIN_PRESETS.find((p) => p.id === "custom");
                if (!customBuiltin) return null;
                const active = hasChosenPreset && isPresetActive(customBuiltin.selected) && activeCustomPresetId === null;
                return (
                  <button
                    key="custom"
                    type="button"
                    onClick={() => setShowCreatePreset(true)}
                    className={[
                      "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-amber-500/60 bg-ds-surface shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
                        : "border-ds-border bg-ds-surface-subtle hover:border-ds-border-strong",
                    ].join(" ")}
                  >
                    <div className="text-sm font-medium">{customBuiltin.name}</div>
                    <div className="text-xs text-ds-text-muted">{customBuiltin.description}</div>
                  </button>
                );
              })()}
            </div>

            {showCreatePreset && (
              <div className="mt-4 rounded-xl border border-ds-border bg-ds-surface-subtle px-4 py-3 space-y-2">
                <label className="block text-sm font-medium text-ds-text">New preset name</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Home Gym"
                    maxLength={60}
                    value={newPresetName}
                    onChange={(e) => {
                      setNewPresetName(e.target.value);
                      setPresetNameError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), createNewPreset())}
                    className="flex-1 min-w-[140px] rounded-xl border border-ds-border bg-ds-bg px-3 py-2 text-sm text-ds-text placeholder:text-ds-text-muted focus:border-ds-border-strong focus:outline-none focus:ring-1 focus:ring-ds-border-strong"
                    aria-invalid={!!presetNameError}
                    aria-describedby={presetNameError ? "preset-name-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={createNewPreset}
                    className="rounded-xl border border-transparent bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:pointer-events-none shrink-0"
                    disabled={!newPresetName.trim()}
                  >
                    Create preset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePreset(false);
                      setNewPresetName("");
                      setPresetNameError(null);
                    }}
                    className="rounded-xl border border-ds-border bg-ds-surface px-4 py-2 text-sm font-medium text-ds-text hover:bg-ds-surface-hover transition-colors shrink-0"
                  >
                    Cancel
                  </button>
                </div>
                {presetNameError && (
                  <p id="preset-name-error" className="text-xs text-red-400">
                    {presetNameError}
                  </p>
                )}
              </div>
            )}

          </div>

          {!showCreatePreset && hasChosenPreset && (
            <>
              {(["Gymnastics", "Strength", "Conditioning", "Optional"] as EquipmentCategory[]).map((cat) => (
                <div key={cat} className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm font-semibold">{cat}</div>
                      <div className="text-xs text-ds-text-muted">Tap to toggle. Weight ranges appear only when selected.</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {byCategory(cat).map((e) => {
                      const active = selectedIds.has(e.id);
                      const selected = local.selected.find((s) => s.id === e.id);
                      return (
                        <EquipmentCard
                          key={e.id}
                          id={e.id}
                          label={e.label}
                          Icon={e.Icon}
                          active={active}
                          weightDependent={e.weightDependent}
                          minWeight={selected?.minWeight}
                          maxWeight={selected?.maxWeight}
                          weightError={weightErrors[e.id]}
                          onToggle={() => toggle(e.id)}
                          onChangeWeights={(next) => changeWeights(e.id, next)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

      </div>

      {/* Remove preset confirmation */}
      {presetToRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPresetToRemove(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-preset-title"
        >
          <div
            className="mx-4 w-full max-w-xs rounded-ds-xl border border-ds-border bg-ds-surface p-5 shadow-ds-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="remove-preset-title" className="text-lg font-semibold text-ds-text mb-1">
              Remove preset?
            </h3>
            <p className="text-sm text-ds-text-muted mb-5">
              Are you sure you want to remove &quot;{presetToRemove.name}&quot;? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPresetToRemove(null)}
                className="flex-1 rounded-ds-xl border border-ds-border bg-ds-surface-subtle py-2.5 text-sm font-medium text-ds-text hover:bg-ds-surface-hover transition-all duration-250"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeCustomPreset(presetToRemove.id);
                  setPresetToRemove(null);
                }}
                className="flex-1 rounded-ds-xl bg-amber-400 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-300 transition-all duration-250"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

