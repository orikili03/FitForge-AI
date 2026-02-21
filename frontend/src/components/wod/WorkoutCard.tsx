import { EquipmentTags } from "./EquipmentTags";
import { WodBlock } from "./WodBlock";

export interface WorkoutCardWod {
  type: string;
  duration: number;
  description: string;
  movements: string[];
  rounds?: number;
  movementItems?: { reps: number; name: string; weight?: string; distance?: string }[];
}

export interface WorkoutCardProps {
  wod: WorkoutCardWod;
  /** Optional equipment IDs to show as tags */
  equipmentRequired?: string[];
  children?: React.ReactNode;
  className?: string;
}

export function WorkoutCard({
  wod,
  equipmentRequired = [],
  children,
  className = "",
}: WorkoutCardProps) {
  return (
    <article
      className={
        "rounded-ds-lg border border-ds-border bg-ds-surface p-ds-4 text-ds-text " +
        "shadow-ds-sm " +
        className
      }
    >
      <div className="space-y-ds-4">
        {equipmentRequired.length > 0 && (
          <EquipmentTags equipmentIds={equipmentRequired} />
        )}
        <WodBlock
          type={wod.type}
          durationMinutes={wod.duration}
          rounds={wod.rounds}
          movementItems={wod.movementItems}
          movements={wod.movements}
        />
      </div>
      {children && (
        <div className="mt-ds-4 pt-ds-3 border-t border-ds-border">
          {children}
        </div>
      )}
    </article>
  );
}
