import { WodBlock } from "./WodBlock";
import { ScalingOptionsBlock } from "./ScalingOptionsBlock";
import { EquipmentTags } from "./EquipmentTags";
import type { WorkoutSpec } from "../../domains/workouts/api";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface WodDetailCardProps {
    wod: WorkoutSpec["wod"];
    equipmentRequired?: string[];
    /** Preset/rig name used for this workout (e.g. "Home/Garage", "Travel"). */
    equipmentPresetName?: string;
    /** When set, scaling options render above the WOD; selections apply instantly to the WOD below. */
    scalingOptions?: {
        options: string[];
        selectedLabels: string[];
        onSelectionChange: (labels: string[]) => void;
    };
    children?: ReactNode;
    className?: string;
}

/** Detailed WOD display with optional scaling (live) and WodBlock. */
export function WodDetailCard({
    wod,
    equipmentRequired = [],
    equipmentPresetName,
    scalingOptions,
    children,
    className = "",
}: WodDetailCardProps) {
    return (
        <article
            className={cn(
                "rounded-ds-lg border border-ds-border bg-ds-surface p-ds-4 text-ds-text shadow-ds-sm",
                className
            )}
        >
            <div className="space-y-ds-4">
                <WodBlock
                    key={
                        wod.movementItems?.length
                            ? wod.movementItems.map((m) => m.name).join("\0")
                            : wod.movements.join("\0")
                    }
                    type={wod.type}
                    durationMinutes={wod.duration ?? 0}
                    rounds={wod.rounds}
                    movementItems={wod.movementItems}
                    movements={wod.movements}
                />
                {(equipmentPresetName || equipmentRequired.length > 0) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {equipmentPresetName && (
                            <span className="text-ds-body-sm text-ds-text-muted">
                                Equipment: <span className="font-medium text-ds-text">{equipmentPresetName}</span>
                            </span>
                        )}
                        {equipmentRequired.length > 0 && (
                            <EquipmentTags equipmentIds={equipmentRequired} />
                        )}
                    </div>
                )}
                {scalingOptions && (
                    <ScalingOptionsBlock
                        scalingOptions={scalingOptions.options}
                        selectedLabels={scalingOptions.selectedLabels}
                        onSelectionChange={scalingOptions.onSelectionChange}
                        className="mt-ds-2"
                    />
                )}
            </div>
            {children && (
                <div className="mt-ds-4 pt-ds-3 border-t border-ds-border">
                    {children}
                </div>
            )}
        </article>
    );
}
