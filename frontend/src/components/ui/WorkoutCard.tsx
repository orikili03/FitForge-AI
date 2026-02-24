import { Link } from "react-router-dom";
import { Card } from "./Card";
import { Button } from "./Button";
import { expandForDisplay } from "../../lib/abbreviations";
import { cn } from "../../lib/utils";

export interface SummaryWorkoutCardWod {
    type: string;
    duration?: number;
    description: string;
    movements: string[];
}

export interface SummaryWorkoutCardProps {
    title: string;
    wod: SummaryWorkoutCardWod;
    movementPreviewCount?: number;
    primaryActionLabel?: string;
    primaryActionHref?: string;
    onPrimaryAction?: () => void;
    className?: string;
}

export function SummaryWorkoutCard({
    title,
    wod,
    movementPreviewCount = 4,
    primaryActionLabel = "Start Workout",
    primaryActionHref,
    onPrimaryAction,
    className = "",
}: SummaryWorkoutCardProps) {
    const previewMovements = wod.movements.slice(0, movementPreviewCount);
    const hasMore = wod.movements.length > movementPreviewCount;

    return (
        <Card className={cn("flex flex-col", className)} padding="lg">
            <div className="flex-1">
                <p className="text-ds-caption font-semibold uppercase tracking-wider text-amber-400">
                    {wod.type}
                </p>
                <h3 className="mt-1.5 text-ds-title font-bold tracking-tight text-amber-400">
                    {title}
                </h3>
                <p className="mt-2 text-ds-body-sm text-ds-text-secondary">
                    {wod.description}
                </p>
                <div className="mt-ds-2">
                    <p className="text-ds-caption font-medium uppercase tracking-wider text-ds-text-muted">
                        Key movements
                    </p>
                    <ul className="mt-1.5 space-y-1 text-ds-body-sm text-ds-text">
                        {previewMovements.map((m) => (
                            <li key={m} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                                {expandForDisplay(m)}
                            </li>
                        ))}
                        {hasMore && (
                            <li className="text-ds-text-muted text-ds-caption">
                                +{wod.movements.length - movementPreviewCount} more
                            </li>
                        )}
                    </ul>
                </div>
                {wod.duration != null && wod.duration > 0 && (
                    <div className="mt-ds-2 flex items-center gap-2 text-ds-body-sm text-ds-text-muted">
                        <span>Time cap</span>
                        <span className="font-semibold text-ds-text">{wod.duration} min</span>
                    </div>
                )}
            </div>
            <div className="mt-ds-3 border-t border-ds-border pt-ds-3">
                {primaryActionHref ? (
                    <Link to={primaryActionHref} className="block">
                        <Button variant="primary" size="lg" fullWidth>
                            {primaryActionLabel}
                        </Button>
                    </Link>
                ) : (
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={onPrimaryAction}
                    >
                        {primaryActionLabel}
                    </Button>
                )}
            </div>
        </Card>
    );
}
