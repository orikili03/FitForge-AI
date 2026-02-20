import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { computeTimerState } from './timerUtils';
import { useAudioFeedback } from './useAudioFeedback';
import type { TimerConfig, ComputedTimerState, TimerStatus } from './timerTypes';

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
  const [status, setStatus] = useState<TimerStatus>('idle');

  // Mutable refs for interval math — avoids stale-closure bugs
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const pausedDurationRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track previous phase/round to detect transitions
  const prevPhaseRef = useRef(computed_initial(config).phase);
  const prevRoundRef = useRef(computed_initial(config).round);
  const finishedFiredRef = useRef(false);

  const { onPhaseChange, onComplete } = useAudioFeedback();
  // Keep audio callbacks in refs so the interval never captures stale versions
  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const computed = useMemo(() => computeTimerState(elapsed, config), [elapsed, config]);

  // Detect phase/round transitions and timer completion
  useEffect(() => {
    if (status !== 'running') return;

    if (computed.isFinished && !finishedFiredRef.current) {
      finishedFiredRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStatus('finished');
      onCompleteRef.current();
      return;
    }

    const phaseChanged = computed.phase !== prevPhaseRef.current;
    const roundChanged = computed.round !== prevRoundRef.current;

    if ((phaseChanged || roundChanged) && !computed.isFinished) {
      onPhaseChangeRef.current(computed.phase, computed.round, config.totalRounds);
    }

    prevPhaseRef.current = computed.phase;
    prevRoundRef.current = computed.round;
  }, [computed, status, config.totalRounds]);

  const updateElapsed = useCallback(() => {
    if (startTimeRef.current === null) return;
    const raw = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000;
    setElapsed(raw);
  }, []);

  const start = useCallback(() => {
    finishedFiredRef.current = false;
    prevPhaseRef.current = 'WORK';
    prevRoundRef.current = 1;
    pausedDurationRef.current = 0;
    pausedAtRef.current = null;
    startTimeRef.current = Date.now();
    setElapsed(0);
    setStatus('running');
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(updateElapsed, 100);
  }, [updateElapsed]);

  const pause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pausedAtRef.current = Date.now();
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (pausedAtRef.current !== null) {
      pausedDurationRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setStatus('running');
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(updateElapsed, 100);
  }, [updateElapsed]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('finished');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { elapsed, status, computed, start, pause, resume, stop };
}

function computed_initial(config: TimerConfig) {
  return computeTimerState(0, config);
}
