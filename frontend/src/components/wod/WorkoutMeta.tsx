import { ProtocolTooltip } from "./ProtocolTooltip";

export interface WorkoutMetaProps {
  type: string;
  durationMinutes: number;
  timeDomain?: string;
  className?: string;
}

export function WorkoutMeta({
  type,
  durationMinutes,
  timeDomain,
  className = "",
}: WorkoutMetaProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-ds-heading font-semibold text-ds-text tracking-tight">
          <ProtocolTooltip protocolLabel={type}>
            {type}
          </ProtocolTooltip>
        </span>
        <span className="text-ds-text-muted">·</span>
        <span className="text-ds-body-sm font-medium text-ds-text-secondary">
          {durationMinutes} min
        </span>
        {timeDomain && (
          <>
            <span className="text-ds-text-muted">·</span>
            <span className="text-ds-caption text-ds-text-muted uppercase tracking-wider">
              {timeDomain}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
