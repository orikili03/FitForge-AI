import { EQUIPMENT_CATALOG } from "../../features/equipment/equipmentCatalog";

const EQUIPMENT_COLORS: Record<string, string> = {
  Gymnastics: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Strength: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  Conditioning: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Optional: "bg-stone-500/15 text-stone-400 border-stone-500/30",
};

export interface EquipmentTagsProps {
  equipmentIds: string[];
  className?: string;
}

export function EquipmentTags({ equipmentIds, className = "" }: EquipmentTagsProps) {
  if (equipmentIds.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-ds-caption font-medium uppercase tracking-wider text-ds-text-muted mb-2">
        Equipment required
      </p>
      <ul className="flex flex-wrap gap-2">
        {equipmentIds.map((id) => {
          const item = EQUIPMENT_CATALOG.find((e) => e.id === id);
          const label = item?.label ?? id.replace(/_/g, " ");
          const colorClass = EQUIPMENT_COLORS[item?.category ?? "Optional"] ?? EQUIPMENT_COLORS.Optional;
          return (
            <li key={id}>
              <span
                className={"inline-flex items-center rounded-full border px-2.5 py-0.5 text-ds-caption font-medium " + colorClass}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
