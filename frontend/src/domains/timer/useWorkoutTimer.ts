import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { computeTimerState } from "./utils";
import { useAudioFeedback } from "./useAudioFeedback";
import type { TimerConfig, ComputedTimerState, TimerStatus } from "./api";

export interface UseWorkoutTimerReturn {
    elapsed: number;
    status: TimerStatus;
    computed: ComputedTimerState;
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
}

export function useWorkoutTimer(config: TimerConfig): UseWorkoutTimerReturn {
    const [elapsed, setElapsed] = useState(0);
    const [status, setStatus] = useState<TimerStatus>("idle");

    // Mutable refs for interval math — avoids stale-closure bugs
    const startTimeRef = useRef<number | null>(null);
    const pausedAtRef = useRef<number | null>(null);
    const pausedDurationRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Track previous phase/round to detect transitions
    const prevPhaseRef = useRef(computed_initial(config).phase);
    const prevRoundRef = useRef(computed_initial(config).round);
    const finishedFiredRef = useRef(false);

    const { onPhaseChange, onComplete, onNearEndTick } = useAudioFeedback();
    const onPhaseChangeRef = useRef(onPhaseChange);
    const onCompleteRef = useRef(onComplete);
    const onNearEndTickRef = useRef(onNearEndTick);

    useLayoutEffect(() => {
        onPhaseChangeRef.current = onPhaseChange;
        onCompleteRef.current = onComplete;
        onNearEndTickRef.current = onNearEndTick;
    }, [onPhaseChange, onComplete, onNearEndTick]);
    const nearEndScheduledRef = useRef(false);
    const nearEndTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const computed = useMemo(() => computeTimerState(elapsed, config), [elapsed, config]);

    // Detect phase/round transitions and timer completion
    useEffect(() => {
        if (status !== "running") return;

        if (computed.isFinished && !finishedFiredRef.current) {
            finishedFiredRef.current = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
            setStatus("finished");
            onCompleteRef.current();
            return;
        }

        const phaseChanged = computed.phase !== prevPhaseRef.current;
        const roundChanged = computed.round !== prevRoundRef.current;

        if ((phaseChanged || roundChanged) && !computed.isFinished) {
            onPhaseChangeRef.current(computed.phase);
        }

        // EMOM: schedule beeps exactly at 5, 4, 3, 2, 1 sec left (from 55 sec of minute to 0), once
        if (config.type === "EMOM" && status === "running" && !computed.isFinished && computed.round === config.totalRounds && !nearEndScheduledRef.current) {
            const displaySec = computed.displaySeconds;
            if (displaySec <= 5 && displaySec > 0) {
                nearEndScheduledRef.current = true;
                for (let s = 5; s >= 1; s--) {
                    if (displaySec > s) {
                        const delayMs = (displaySec - s) * 1000;
                        const id = setTimeout(() => onNearEndTickRef.current(), delayMs);
                        nearEndTimeoutsRef.current.push(id);
                    }
                }
            }
        }

        prevPhaseRef.current = computed.phase;
        prevRoundRef.current = computed.round;
    }, [computed, status, config.totalRounds, config.type]);

    const updateElapsed = useCallback(() => {
        if (startTimeRef.current === null) return;
        const raw = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000;
        setElapsed(raw);
    }, []);

    const start = useCallback(() => {
        finishedFiredRef.current = false;
        prevPhaseRef.current = "WORK";
        prevRoundRef.current = 1;
        pausedDurationRef.current = 0;
        pausedAtRef.current = null;
        startTimeRef.current = Date.now();
        setElapsed(0);
        setStatus("running");
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(updateElapsed, 100);
    }, [updateElapsed]);

    const pause = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        nearEndTimeoutsRef.current.forEach(clearTimeout);
        nearEndTimeoutsRef.current = [];
        nearEndScheduledRef.current = false;
        pausedAtRef.current = Date.now();
        setStatus("paused");
    }, []);

    const resume = useCallback(() => {
        if (pausedAtRef.current !== null) {
            pausedDurationRef.current += Date.now() - pausedAtRef.current;
            pausedAtRef.current = null;
        }
        setStatus("running");
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(updateElapsed, 100);
    }, [updateElapsed]);

    const stop = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus("finished");
    }, []);

    const clearNearEndTimeouts = useCallback(() => {
        nearEndTimeoutsRef.current.forEach(clearTimeout);
        nearEndTimeoutsRef.current = [];
        nearEndScheduledRef.current = false;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            clearNearEndTimeouts();
        };
    }, [clearNearEndTimeouts]);

    return { elapsed, status, computed, start, pause, resume, stop };
}

function computed_initial(config: TimerConfig) {
    return computeTimerState(0, config);
}
