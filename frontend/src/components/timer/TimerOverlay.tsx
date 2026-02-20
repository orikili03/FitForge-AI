import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Pause, Play, ChevronRight } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import { WorkoutSummary } from './WorkoutSummary';
import { useWorkoutTimer } from '../../features/timer/useWorkoutTimer';
import { useRepCounter } from '../../features/timer/useRepCounter';
import { useAudioFeedback } from '../../features/timer/useAudioFeedback';
import {
  parseTimerConfig,
  formatTime,
  needsRepCounter,
  getPhaseBadge,
  getRoundLabel,
} from '../../features/timer/timerUtils';
import type { WorkoutSessionResult } from '../../features/timer/timerTypes';
import type { WorkoutResponse } from '../../features/workouts/workoutApi';

const WORK_COLOR = '#f59e0b';
const REST_COLOR = '#60a5fa';
const RING_SIZE = 288;
const RING_STROKE = 8;

type OverlayStage = 'countdown' | 'active' | 'summary';

interface TimerOverlayProps {
  workout: WorkoutResponse;
  onClose: () => void;
}

export function TimerOverlay({ workout, onClose }: TimerOverlayProps) {
  const config = parseTimerConfig(workout);
  const timer = useWorkoutTimer(config);
  const repCounter = useRepCounter();
  const audio = useAudioFeedback();

  const [stage, setStage] = useState<OverlayStage>('countdown');
  const [countdownNum, setCountdownNum] = useState(3);
  const [sessionResult, setSessionResult] = useState<WorkoutSessionResult | null>(null);
  const [visible, setVisible] = useState(false);

  const hasFinishedRef = useRef(false);
  // Keep mutable refs so callbacks always see fresh values
  const timerRef = useRef(timer);
  timerRef.current = timer;
  const repCounterRef = useRef(repCounter);
  repCounterRef.current = repCounter;
  const audioRef = useRef(audio);
  audioRef.current = audio;
  // Keep a stable ref to timer.start for the stage-change effect
  const timerStartRef = useRef(timer.start);
  timerStartRef.current = timer.start;

  const showReps = needsRepCounter(config.type);

  // Fade-in the whole overlay after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(t);
  }, []);

  // 3-2-1 countdown sequence
  useEffect(() => {
    const steps: Array<[number, number]> = [
      [3, 0],
      [2, 1000],
      [1, 2000],
    ];
    const ids: ReturnType<typeof setTimeout>[] = [];

    steps.forEach(([num, delay]) => {
      ids.push(
        setTimeout(() => {
          setCountdownNum(num);
          audioRef.current.onCountdownTick(num);
        }, delay),
      );
    });

    // Switch to active stage after "1" has been shown for 1 second
    ids.push(
      setTimeout(() => {
        setStage('active');
      }, 3000),
    );

    return () => ids.forEach(clearTimeout);
  }, []); // intentionally runs once on mount

  // Start the timer when the stage flips to 'active'
  useEffect(() => {
    if (stage === 'active') {
      timerStartRef.current();
    }
  }, [stage]);

  // Collect result and move to summary when timer finishes naturally
  useEffect(() => {
    if (timer.status === 'finished' && stage === 'active' && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      const result = buildResult();
      setSessionResult(result);
      setStage('summary');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.status, stage]);

  // Keyboard: Space → +1 rep (active stage only)
  useEffect(() => {
    if (!showReps || stage !== 'active') return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        repCounterRef.current.addRep();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showReps, stage]);

  const buildResult = useCallback((): WorkoutSessionResult => ({
    totalElapsed: timerRef.current.elapsed,
    repsByRound: [...repCounterRef.current.repsByRound],
    totalReps: repCounterRef.current.totalReps,
    config,
    workoutId: workout.id,
  }), [config, workout.id]);

  const handleEndWorkout = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    timerRef.current.stop();
    setSessionResult(buildResult());
    setStage('summary');
  }, [buildResult]);

  // --- Derived display values ---
  const phaseColor = timer.computed.phase === 'WORK' ? WORK_COLOR : REST_COLOR;
  const phaseBadge = getPhaseBadge(config, timer.computed.phase);
  const roundLabel = getRoundLabel(config, timer.computed.round);

  const rawDisplay = timer.computed.displaySeconds;
  const displayInt = config.type === 'FOR_TIME' ? Math.floor(rawDisplay) : Math.ceil(rawDisplay);
  const formattedTime = formatTime(displayInt);

  // Pulsing when near end: last 10s for countdown types, or last 10% of phase for intervals
  const isCountdown = config.type !== 'FOR_TIME';
  const nearEndSeconds = isCountdown && !timer.computed.isFinished && displayInt <= 10;
  const nearEndProgress = timer.computed.phaseProgress >= 0.92 && !timer.computed.isFinished;
  const isPulsing = (nearEndSeconds || nearEndProgress) && timer.status === 'running';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ds-bg overflow-hidden select-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}
    >
      {/* Phase ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(245,158,11,0.11) 0%, transparent 65%)',
          opacity: stage === 'active' && timer.computed.phase === 'WORK' && timer.status === 'running' ? 1 : 0,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(96,165,250,0.11) 0%, transparent 65%)',
          opacity: stage === 'active' && timer.computed.phase === 'REST' && timer.status === 'running' ? 1 : 0,
        }}
      />

      {/* ─── COUNTDOWN ─── */}
      {stage === 'countdown' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs uppercase tracking-widest text-ds-text-muted font-medium">
            Get Ready
          </p>
          <div
            key={countdownNum}
            className="font-display font-black text-ds-text leading-none tabular-nums"
            style={{
              fontSize: 'clamp(6rem, 24vw, 9rem)',
              textShadow: '0 0 80px rgba(245,158,11,0.35)',
              animation: 'timerPulseIn 0.25s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            {countdownNum}
          </div>
          <p className="text-sm text-ds-text-secondary">
            {workout.wod.type} · {workout.wod.duration} min
          </p>
        </div>
      )}

      {/* ─── ACTIVE TIMER ─── */}
      {stage === 'active' && (
        <>
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-ds-text-secondary">
                {workout.wod.type}
              </p>
              <p className="text-xs text-ds-text-muted">{workout.wod.duration} min</p>
            </div>
            <button
              onClick={handleEndWorkout}
              className="flex items-center gap-1.5 rounded-ds-md border border-ds-border bg-ds-surface px-3 py-2 text-xs font-medium text-ds-text-muted hover:border-ds-border-strong hover:text-ds-text transition-all duration-250"
            >
              <X size={12} />
              End Workout
            </button>
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center gap-6 pt-16 pb-20">
            {/* Progress ring + time display */}
            <div
              className={`relative flex items-center justify-center transition-all duration-300 ${isPulsing ? 'timer-near-end-ring' : ''}`}
              style={{ width: RING_SIZE, height: RING_SIZE }}
            >
              <ProgressRing
                size={RING_SIZE}
                strokeWidth={RING_STROKE}
                progress={timer.computed.phaseProgress}
                color={phaseColor}
              />
              {/* Inner content — absolutely centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-500"
                  style={{ color: phaseColor }}
                >
                  {phaseBadge}
                </span>
                <span
                  className={`font-display font-black text-ds-text tabular-nums leading-none transition-transform duration-300 ${isPulsing ? 'timer-near-end-text' : ''}`}
                  style={{ fontSize: 'clamp(3.25rem, 14vw, 5.25rem)' }}
                >
                  {formattedTime}
                </span>
                {config.type === 'FOR_TIME' && (
                  <span className="text-[10px] text-ds-text-muted mt-0.5">Elapsed</span>
                )}
                {roundLabel && (
                  <span className="text-[11px] text-ds-text-muted mt-0.5">{roundLabel}</span>
                )}
                {/* Paused indicator */}
                {timer.status === 'paused' && (
                  <span className="text-[10px] uppercase tracking-widest text-ds-text-faint mt-1 animate-pulse">
                    Paused
                  </span>
                )}
              </div>
            </div>

            {/* Rep counter (AMRAP / FOR_TIME) */}
            {showReps && (
              <div className="flex flex-col items-center gap-4">
                {/* Stats row */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-ds-text-muted mb-0.5">Round</p>
                    <p className="text-3xl font-black text-ds-text tabular-nums leading-none">
                      {repCounter.currentRound}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-ds-border" />
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-ds-text-muted mb-0.5">Reps</p>
                    <p className="text-3xl font-black text-ds-text tabular-nums leading-none">
                      {repCounter.totalReps}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {/* Large rep tap button */}
                  <button
                    onClick={repCounter.addRep}
                    aria-label="Add rep"
                    className="flex flex-col items-center justify-center w-[5.5rem] h-[5.5rem] rounded-full font-black active:scale-90 transition-all duration-100"
                    style={{
                      border: `2px solid ${phaseColor}`,
                      color: phaseColor,
                      boxShadow: `0 0 24px ${phaseColor}28`,
                    }}
                  >
                    <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>+1</span>
                    <span className="text-[9px] font-normal text-ds-text-muted mt-0.5 tracking-widest uppercase">
                      Rep
                    </span>
                  </button>

                  <div className="flex flex-col gap-2">
                    {/* Next round (AMRAP only) */}
                    {config.type === 'AMRAP' && (
                      <button
                        onClick={repCounter.nextRound}
                        className="flex items-center gap-1.5 rounded-ds-xl border border-ds-border bg-ds-surface px-3.5 py-2 text-xs font-medium text-ds-text-secondary hover:bg-ds-surface-hover hover:text-ds-text transition-all duration-250"
                      >
                        Next Round
                        <ChevronRight size={13} />
                      </button>
                    )}
                    {/* Undo last rep */}
                    <button
                      onClick={repCounter.removeRep}
                      className="flex items-center gap-1.5 rounded-ds-xl border border-ds-border bg-ds-surface px-3.5 py-2 text-xs font-medium text-ds-text-muted hover:bg-ds-surface-hover hover:text-ds-text transition-all duration-250"
                    >
                      Undo rep
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-ds-text-faint">
                  Space&thinsp;=&thinsp;+1 rep
                </p>
              </div>
            )}
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-8">
            {timer.status === 'running' ? (
              <button
                onClick={timer.pause}
                className="flex items-center gap-2 rounded-ds-xl border border-ds-border bg-ds-surface px-7 py-3 text-sm font-medium text-ds-text hover:bg-ds-surface-hover transition-all duration-250"
              >
                <Pause size={14} />
                Pause
              </button>
            ) : (
              <button
                onClick={timer.resume}
                className="flex items-center gap-2 rounded-ds-xl border border-ds-border bg-ds-surface px-7 py-3 text-sm font-medium text-ds-text hover:bg-ds-surface-hover transition-all duration-250"
              >
                <Play size={14} />
                Resume
              </button>
            )}
          </div>
        </>
      )}

      {/* ─── SUMMARY ─── */}
      {stage === 'summary' && sessionResult && (
        <WorkoutSummary workout={workout} result={sessionResult} onClose={onClose} />
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes timerPulseIn {
          from { transform: scale(1.35); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes summaryIn {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes timerNearEndRing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.04); opacity: 0.95; }
        }
        @keyframes timerNearEndText {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        .timer-near-end-ring {
          animation: timerNearEndRing 1s ease-in-out infinite;
        }
        .timer-near-end-text {
          animation: timerNearEndText 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
