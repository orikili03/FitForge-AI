import { ProtocolTooltip } from "./ProtocolTooltip";

/** Time-capped protocols: show duration (e.g. EMOM 24, AMRAP 20). Volume-focused: no time. */
const TIME_CAPPED_PROTOCOLS = ["AMRAP", "EMOM", "TABATA"];

export interface MovementItemSpec {
  reps: number;
  name: string;
  weight?: string;
  distance?: string;
}

function getProtocolHeading(
  type: string,
  durationMinutes: number,
  rounds?: number
): string {
  if (rounds != null && rounds > 0) {
    return `${rounds} Rounds for time`;
  }
  const showDuration = TIME_CAPPED_PROTOCOLS.some((p) =>
    type.toUpperCase().startsWith(p)
  );
  if (showDuration && durationMinutes > 0) return `${type} ${durationMinutes}`;
  return type;
}

function parseLegacyMovement(
  item: string
): { name: string; weight?: string; distance?: string } {
  const match = item.match(/^(.+?)\s+@\s+(.+)$/);
  if (match) {
    const [, name, value] = match;
    const trimmed = value.trim().toLowerCase();
    const isDistance =
      /^\d*\.?\d+\s*m$/.test(trimmed) ||
      /^\d*\.?\d+\s*(m|in|ft)$/.test(trimmed);
    if (isDistance) return { name: name.trim(), distance: value.trim() };
    return { name: name.trim(), weight: value.trim() };
  }
  return { name: item };
}

function formatMovementName(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export interface WodBlockProps {
  type: string;
  durationMinutes: number;
  /** When set, heading shows "N Rounds for time" (RFT-style). */
  rounds?: number;
  /** Structured reps + name + weight/distance; takes precedence over movements. */
  movementItems?: MovementItemSpec[];
  /** Fallback when movementItems not provided. */
  movements: string[];
  className?: string;
}

export function WodBlock({
  type,
  durationMinutes,
  rounds,
  movementItems,
  movements,
  className = "",
}: WodBlockProps) {
  const heading = getProtocolHeading(type, durationMinutes, rounds);
  const useStructured = movementItems && movementItems.length > 0;

  return (
    <div className={className}>
      <h2 className="text-ds-heading font-semibold text-ds-text tracking-tight mb-3">
        <ProtocolTooltip protocolLabel={type}>{heading}:</ProtocolTooltip>
      </h2>
      <ul className="space-y-1.5">
        {useStructured
          ? movementItems!.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-baseline gap-2 text-ds-body text-ds-text"
              >
                <span className="text-ds-text-muted">•</span>
                <span className="flex-1">
                  {item.reps} {formatMovementName(item.name)}
                </span>
                {(item.weight || item.distance) && (
                  <span className="text-ds-body-sm text-ds-text-muted shrink-0">
                    {item.weight && `@ ${item.weight}`}
                    {item.distance && !item.weight && `@ ${item.distance}`}
                  </span>
                )}
              </li>
            ))
          : movements.map((item, i) => {
              const { name, weight, distance } = parseLegacyMovement(item);
              const displayName = formatMovementName(name);
              return (
                <li
                  key={`${name}-${i}`}
                  className="flex items-baseline gap-2 text-ds-body text-ds-text"
                >
                  <span className="text-ds-text-muted">•</span>
                  <span className="flex-1">{displayName}</span>
                  {(weight || distance) && (
                    <span className="text-ds-body-sm text-ds-text-muted shrink-0">
                      {weight && `@ ${weight}`}
                      {distance && !weight && `@ ${distance}`}
                    </span>
                  )}
                </li>
              );
            })}
      </ul>
    </div>
  );
}
