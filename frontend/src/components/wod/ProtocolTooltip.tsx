import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

const PROTOCOL_EXPLANATIONS: Record<string, string> = {
    "For Time":
        "Complete the prescribed work as fast as possible. Record your time.",
    RFT: "Rounds for time. Complete a set number of rounds as fast as possible.",
    "Rounds for time": "Complete a set number of rounds as fast as possible.",
    EMOM:
        "Every minute on the minute. Perform the work at the start of each minute; rest the remainder.",
    AMRAP:
        "As many rounds or reps as possible within the time cap.",
    TABATA:
        "20 seconds work, 10 seconds rest, 8 rounds. High-intensity intervals.",
    "Death By":
        "Add one rep each round. Start at 1, then 2, then 3… until you can't complete the round within the minute.",
    "FOR-TIME": "Rounds for time. Complete a set number of rounds as fast as possible.",
    "21-15-9":
        "Descending rep scheme. Complete 21, then 15, then 9 reps of each movement for time.",
    LADDER: "Continuous rep increment (e.g. 2, 4, 6...) until the time cap or failure.",
    CHIPPER: "A long series of diverse movements to be 'chipped' away at sequentially.",
    INTERVAL: "Fixed work windows followed by fixed rest, focusing on repeatability.",
    "STRENGTH-SINGLE": "Max effort weightlifting focused on absolute force production (1RM).",
    "STRENGTH-SETS": "Sub-maximal sets (e.g. 5x5) focused on volume and positional strength.",
    STRENGTH: "Max effort weightlifting focused on absolute force production.",
    "REST-DAY": "Active recovery to support tissue repair and long-term adaptation.",
    OTHER: "Mixed methodology or modular training format.",
};

export interface ProtocolTooltipProps {
    protocolLabel: string;
    children: ReactNode;
    className?: string;
}

export function ProtocolTooltip({ protocolLabel, children, className = "" }: ProtocolTooltipProps) {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLSpanElement>(null);

    const text = PROTOCOL_EXPLANATIONS[protocolLabel] ?? "Workout format and pacing.";

    useEffect(() => {
        if (!visible || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({ x: rect.left + rect.width / 2, y: rect.bottom });
    }, [visible]);

    return (
        <>
            <span
                ref={triggerRef}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                className={"cursor-help border-b border-ds-border-strong border-dotted " + className}
            >
                {children}
            </span>
            {visible && (
                <div
                    className="fixed z-50 max-w-[260px] rounded-ds-sm border border-ds-border bg-[#1c1a18] px-3 py-2 text-left text-ds-body-sm text-ds-text-secondary shadow-ds-md"
                    style={{
                        left: coords.x,
                        top: coords.y + 6,
                        transform: "translateX(-50%)",
                    }}
                    role="tooltip"
                >
                    {text}
                </div>
            )}
        </>
    );
}
