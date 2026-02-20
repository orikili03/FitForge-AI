import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Save, Sparkles, X } from "lucide-react";

import { useEquipmentState, useUpdateEquipment } from "../features/equipment/equipmentApi";
import { BUILTIN_PRESETS, EQUIPMENT_CATALOG, EquipmentCategory } from "../features/equipment/equipmentCatalog";
import { CustomPreset, EquipmentSelection, EquipmentState } from "../features/equipment/equipmentTypes";

function byCategory(category: EquipmentCategory) {
  return EQUIPMENT_CATALOG.filter((e) => e.category === category);
}

function isWeightDependent(id: string) {
  return EQUIPMENT_CATALOG.find((e) => e.id === id)?.weightDependent ?? false;
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

function SortableSelectedRow({ item, label }: { item: EquipmentSelection; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-3 rounded-lg border border-ds-border bg-ds-surface-subtle px-3 py-2"
    >
      <div className="text-sm">
        <div className="font-medium">{label}</div>
        {(item.minWeight !== undefined || item.maxWeight !== undefined) && (
          <div className="text-xs text-ds-text-muted">
            {item.minWeight ?? "?"}–{item.maxWeight ?? "?"} kg
          </div>
        )}
      </div>
      <button
        type="button"
        className="text-xs text-ds-text-muted hover:text-ds-text"
        {...attributes}
        {...listeners}
      >
        Drag
      </button>
    </div>
  );
}

export function EquipmentPage() {
  const { data, isLoading } = useEquipmentState();
  const updateMutation = useUpdateEquipment();

  const [local, setLocal] = useState<EquipmentState>({ selected: [], customPresets: [] });
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const selectedIds = useMemo(() => new Set(local.selected.map((s) => s.id)), [local.selected]);

  const toggle = (id: string) => {
    setLocal((prev) => {
      const exists = prev.selected.find((s) => s.id === id);
      if (exists) {
        return { ...prev, selected: prev.selected.filter((s) => s.id !== id) };
      }
      return { ...prev, selected: [...prev.selected, { id }] };
    });
  };

  const changeWeights = (id: string, next: { minWeight?: number; maxWeight?: number }) => {
    setLocal((prev) => ({
      ...prev,
      selected: prev.selected.map((s) => (s.id === id ? { ...s, ...next } : s)),
    }));
  };

  const applyPreset = (selected: EquipmentSelection[], isCustomPresetId?: string) => {
    setLocal((prev) => ({ ...prev, selected }));
    if (isCustomPresetId) setEditingPresetId(isCustomPresetId);
    else setEditingPresetId(null);
  };

  const updateEditingPreset = () => {
    if (!editingPresetId) return;
    setLocal((prev) => ({
      ...prev,
      customPresets: prev.customPresets.map((p) =>
        p.id === editingPresetId ? { ...p, selected: local.selected } : p
      ),
    }));
    setEditingPresetId(null);
  };

  const removeCustomPreset = (id: string) => {
    setLocal((prev) => ({ ...prev, customPresets: prev.customPresets.filter((p) => p.id !== id) }));
    if (editingPresetId === id) setEditingPresetId(null);
  };

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

      <div className={local.selected.length > 0 ? "grid grid-cols-1 lg:grid-cols-[1.4fr,0.6fr] gap-6" : ""}>
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
              {BUILTIN_PRESETS.filter((p) => p.id !== "none").map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.selected)}
                  className="rounded-xl border border-ds-border bg-ds-surface-subtle px-4 py-3 text-left hover:border-ds-border-strong transition-colors active:scale-[0.99]"
                >
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-ds-text-muted">{p.description}</div>
                </button>
              ))}
            </div>

            {editingPresetId && (() => {
              const preset = local.customPresets.find((p) => p.id === editingPresetId);
              return preset ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                  <span className="text-sm text-ds-text">Editing: {preset.name}</span>
                  <button
                    type="button"
                    onClick={updateEditingPreset}
                    className="btn-primary inline-flex gap-2 text-sm"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Update preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPresetId(null)}
                    className="text-ds-body-sm text-ds-text-muted hover:text-ds-text"
                  >
                    Cancel
                  </button>
                </div>
              ) : null;
            })()}

            {local.customPresets.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-ds-text-muted">Your saved presets — Apply to load, Edit to change and Update.</div>
                {local.customPresets.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-ds-border bg-ds-surface-subtle px-3 py-2">
                    <button
                      type="button"
                      onClick={() => applyPreset(p.selected)}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-ds-text-muted">{p.selected.length} items</div>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => applyPreset(p.selected, p.id)}
                        className="p-1.5 text-ds-text-muted hover:text-ds-text hover:bg-ds-surface rounded"
                        title="Edit this preset"
                        aria-label="Edit preset"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomPreset(p.id)}
                        className="p-1.5 text-ds-text-muted hover:text-red-500 rounded"
                        aria-label="Delete preset"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {local.selected.length > 0 && (
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

        {local.selected.length > 0 && (
        <div className="card">
          <div className="text-sm font-semibold">Priority order</div>
          <div className="text-xs text-ds-text-muted">Drag to reorder your selected equipment (top = most preferred).</div>

          <div className="mt-4">
            {isLoading && <div className="text-sm text-ds-text-muted">Loading...</div>}
            {!isLoading && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => {
                  const { active, over } = event;
                  if (!over || active.id === over.id) return;
                  setLocal((prev) => {
                    const oldIndex = prev.selected.findIndex((s) => s.id === active.id);
                    const newIndex = prev.selected.findIndex((s) => s.id === over.id);
                    return { ...prev, selected: arrayMove(prev.selected, oldIndex, newIndex) };
                  });
                }}
              >
                <SortableContext items={local.selected.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {local.selected.map((s) => {
                      const label = EQUIPMENT_CATALOG.find((c) => c.id === s.id)?.label ?? s.id;
                      return <SortableSelectedRow key={s.id} item={s} label={label} />;
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {hasAnyWeightError && (
              <div className="mt-3 text-[11px] text-red-500">
                Fix weight range errors (Min must be ≤ Max) before saving.
              </div>
            )}

            {updateMutation.isSuccess && (
              <div className="mt-3 text-[11px] text-emerald-400">Saved.</div>
            )}
            {updateMutation.isError && (
              <div className="mt-3 text-[11px] text-red-500">
                {(updateMutation.error as any)?.response?.data?.error?.message ??
                  (updateMutation.error as any).message ??
                  "Unable to save equipment"}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

