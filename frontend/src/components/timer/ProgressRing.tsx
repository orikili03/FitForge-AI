interface ProgressRingProps {
    /** 0–1 where 1 = fully filled */
    progress: number;
    size: number;
    strokeWidth: number;
    color: string;
    trackColor?: string;
    className?: string;
}

export function ProgressRing({
    progress,
    size,
    strokeWidth,
    color,
    trackColor = "rgba(255,255,255,0.07)",
    className = "",
}: ProgressRingProps) {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const clampedProgress = Math.min(1, Math.max(0, progress));
    const dashOffset = circ * (1 - clampedProgress);
    const cx = size / 2;
    const cy = size / 2;

    return (
        // Rotate so the arc starts at the top (12 o'clock)
        <svg
            width={size}
            height={size}
            className={`-rotate-90 ${className}`}
            aria-hidden="true"
        >
            {/* Background track */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
            {/* Progress arc */}
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{
                    transition: "stroke-dashoffset 0.12s linear, stroke 0.6s ease",
                }}
            />
        </svg>
    );
}
