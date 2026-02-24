import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface ChartCardProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
}

export function ChartCard({
    title,
    subtitle,
    className = "",
    children,
    ...props
}: ChartCardProps) {
    return (
        <div
            className={cn(
                "rounded-ds-xl bg-ds-surface p-ds-3 shadow-ds-sm transition-all duration-250 hover:shadow-ds-md",
                className
            )}
            {...props}
        >
            {(title || subtitle) && (
                <div className="mb-ds-2">
                    {title && (
                        <h3 className="text-ds-heading font-semibold tracking-tight text-amber-400">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="mt-0.5 text-ds-body-sm text-ds-text-muted">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}
