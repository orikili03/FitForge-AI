import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
    none: "",
    sm: "p-ds-2",
    md: "p-ds-3",
    lg: "p-ds-4",
};

export function Card({
    padding = "md",
    className = "",
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "rounded-ds-xl bg-ds-surface shadow-ds-sm transition-all duration-250 hover:shadow-ds-md",
                paddingMap[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
