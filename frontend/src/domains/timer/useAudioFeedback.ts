import { useRef, useCallback } from "react";
import type { TimerPhase } from "./api";

export function useAudioFeedback() {
    const audioCtxRef = useRef<AudioContext | null>(null);

    const getCtx = useCallback((): AudioContext | null => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContext();
            }
            if (audioCtxRef.current.state === "suspended") {
                void audioCtxRef.current.resume();
            }
            return audioCtxRef.current;
        } catch {
            return null;
        }
    }, []);

    const beep = useCallback(
        (frequency = 880, duration = 0.15, volume = 0.25) => {
            const ctx = getCtx();
            if (!ctx) return;
            try {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = "sine";
                osc.frequency.value = frequency;
                gain.gain.setValueAtTime(volume, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + duration + 0.05);
            } catch {
                // Web Audio unavailable in this environment
            }
        },
        [getCtx]
    );

    const onPhaseChange = useCallback(
        (phase: TimerPhase) => {
            if (phase === "WORK") {
                beep(880, 0.22, 0.35);
                setTimeout(() => beep(880, 0.12, 0.2), 120);
            } else {
                beep(440, 0.25, 0.35);
            }
        },
        [beep]
    );

    const onComplete = useCallback(() => {
        beep(660, 0.35);
        setTimeout(() => beep(880, 0.45), 180);
    }, [beep]);

    const onCountdownTick = useCallback(
        (num: number) => {
            if (num === 0) {
                beep(1100, 0.3, 0.35);
            } else {
                beep(660, 0.1, 0.2);
            }
        },
        [beep]
    );

    const onNearEndTick = useCallback(
        () => {
            beep(880, 0.15, 0.3);
        },
        [beep]
    );

    return { beep, onPhaseChange, onComplete, onCountdownTick, onNearEndTick };
}
