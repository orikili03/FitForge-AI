import { EQUIPMENT_CATALOG } from "../../domains/equipment/catalog";

export interface EquipmentTagsProps {
    equipmentIds: string[];
}

export function EquipmentTags({ equipmentIds }: EquipmentTagsProps) {
    if (equipmentIds.length === 0) return null;
    const labels = equipmentIds.map((id) => EQUIPMENT_CATALOG.find((e) => e.id === id)?.label ?? id);
    return (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {labels.map((label, i) => (
                <span
                    key={equipmentIds[i]}
                    className="inline-flex items-center rounded-md border border-ds-border bg-ds-surface-subtle px-2 py-0.5 text-ds-caption text-ds-text-muted"
                >
                    {label}
                </span>
            ))}
        </span>
    );
}
