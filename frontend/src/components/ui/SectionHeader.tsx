import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
}

export function SectionHeader({
    title,
    subtitle,
    action,
    className = "",
}: SectionHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-ds-3",
                className
            )}
        >
            <div>
                <h2 className="text-ds-heading font-semibold tracking-tight text-amber-400">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-0.5 text-ds-body-sm text-ds-text-muted">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
