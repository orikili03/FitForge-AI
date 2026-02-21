/**
 * Parses movement string for optional weight/distance (e.g. "deadlift @ 60kg", "box jump @ 0.6m").
 */
function parseMovement(
  item: string | { name: string; weight?: string; distance?: string }
): { name: string; weight?: string; distance?: string } {
  if (typeof item === "object") {
    return { name: item.name, weight: item.weight, distance: item.distance };
  }
  const match = item.match(/^(.+?)\s+@\s+(.+)$/);
  if (match) {
    const [, name, value] = match;
    const trimmed = value.trim().toLowerCase();
    const isDistance = /^\d*\.?\d+\s*m$/.test(trimmed) || /^\d*\.?\d+\s*(m|in|ft)$/.test(trimmed);
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

export interface MovementListProps {
  /** Movement strings or objects with optional weight/distance */
  movements: (string | { name: string; weight?: string; distance?: string })[];
  className?: string;
}

export function MovementList({ movements, className = "" }: MovementListProps) {
  if (movements.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-ds-caption font-medium uppercase tracking-wider text-ds-text-muted mb-2">
        Movements
      </p>
      <ul className="space-y-2">
        {movements.map((item, i) => {
          const { name, weight, distance } = parseMovement(item);
          const displayName = formatMovementName(name);
          return (
            <li
              key={`${name}-${i}`}
              className="flex items-baseline gap-2 text-ds-body text-ds-text"
            >
              <span className="h-1.5 w-1.5 shrink-0 mt-1.5 rounded-full bg-ds-accent/90" />
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
