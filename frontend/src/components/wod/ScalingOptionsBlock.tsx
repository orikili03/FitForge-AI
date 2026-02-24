import { useState, useCallback } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { expandForDisplay } from "../../lib/abbreviations";

export interface ScalingOptionsBlockProps {
    scalingOptions: string[];
    /** When provided, selecting options updates the WOD display (parent applies scaling). */
    onSelectionChange?: (selectedLabels: string[]) => void;
    /** Controlled: which option labels are currently selected (for display WOD). */
    selectedLabels?: string[];
    className?: string;
}

/** Interactive scaling: multi-select. When onSelectionChange is set, parent applies scaling and WOD updates instantly. */
export function ScalingOptionsBlock({
    scalingOptions,
    onSelectionChange,
    selectedLabels: controlledSelected,
    className = "",
}: ScalingOptionsBlockProps) {
    const [expanded, setExpanded] = useState(true);
    const [internalSelected, setInternalSelected] = useState<Set<number>>(new Set());

    const toggle = useCallback(
        (index: number) => {
            const label = scalingOptions[index];
            if (onSelectionChange) {
                const current = controlledSelected ?? [];
                const next = current.includes(label)
                    ? current.filter((l) => l !== label)
                    : [...current, label];
                onSelectionChange(next);
            } else {
                setInternalSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(index)) next.delete(index);
                    else next.add(index);
                    return next;
                });
            }
        },
        [scalingOptions, onSelectionChange, controlledSelected]
    );

    const isSelected = (index: number) => {
        const label = scalingOptions[index];
        if (controlledSelected != null) return controlledSelected.includes(label);
        return internalSelected.has(index);
    };

    const appliedCount = controlledSelected?.length ?? internalSelected.size;

    if (scalingOptions.length === 0) return null;

    return (
        <div
            className={
                "rounded-ds-lg border border-ds-border bg-ds-surface-subtle overflow-hidden " + className
            }
        >
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-ds-body-sm font-medium text-ds-text hover:bg-ds-surface-hover transition-colors focus:outline-none"
                aria-expanded={expanded}
            >
                <span className="flex items-center gap-2">
                    {expanded ? (
                        <ChevronDown className="h-4 w-4 text-ds-text-muted shrink-0" aria-hidden />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-ds-text-muted shrink-0" aria-hidden />
                    )}
                    Scaling options
                </span>
                <span className="text-ds-caption text-ds-text-muted">
                    {scalingOptions.length} option{scalingOptions.length !== 1 ? "s" : ""}
                    {appliedCount > 0 && <> · {appliedCount} applied</>}
                    {onSelectionChange && <> · Live</>}
                </span>
            </button>
            {expanded && (
                <ul className="border-t border-ds-border divide-y divide-ds-border">
                    {scalingOptions.map((option, i) => (
                        <li key={i}>
                            <button
                                type="button"
                                onClick={() => toggle(i)}
                                className={`flex w-full items-start gap-3 px-4 py-3 text-left text-ds-body-sm transition-colors focus:outline-none ${isSelected(i)
                                        ? "bg-amber-400/10 text-ds-text border-l-2 border-amber-400"
                                        : "text-ds-text hover:bg-ds-surface-hover"
                                    }`}
                            >
                                <span
                                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isSelected(i)
                                            ? "border-amber-400 bg-amber-400 text-stone-950"
                                            : "border-ds-border bg-ds-surface"
                                        }`}
                                    aria-hidden
                                >
                                    {isSelected(i) ? <Check className="h-3 w-3" /> : null}
                                </span>
                                <span className="flex-1">{expandForDisplay(option)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
