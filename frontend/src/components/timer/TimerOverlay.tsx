import { useState, useEffect, useRef, useCallback } from "react";
import { X, Pause, Play, RotateCcw } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import { WorkoutSummary } from "./WorkoutSummary";
import { useWorkoutTimer } from "../../domains/timer/useWorkoutTimer";
import { useRoundCounter } from "../../domains/timer/useRoundCounter";
import { useAudioFeedback } from "../../domains/timer/useAudioFeedback";
import {
    parseTimerConfig,
    formatTime,
    getPhaseBadge,
    getRoundLabel,
} from "../../domains/timer/utils";
import type { WorkoutSessionResult } from "../../domains/timer/api";
import type { WorkoutResponse } from "../../domains/workouts/api";
import { cn } from "../../lib/utils";

const WORK_COLOR = "#fbbf24"; // lighter tinted amber
const REST_COLOR = "#60a5fa";
const RING_SIZE = 288;
const RING_STROKE = 8;

type OverlayStage = "countdown" | "active" | "summary";

interface TimerOverlayProps {
    workout: WorkoutResponse;
    onClose: () => void;
}

export function TimerOverlay({ workout, onClose }: TimerOverlayProps) {
    const config = parseTimerConfig(workout);
    const timer = useWorkoutTimer(config);
    const roundCounter = useRoundCounter();
    const audio = useAudioFeedback();

    const [stage, setStage] = useState<OverlayStage>("countdown");
    const [countdownNum, setCountdownNum] = useState(3);
    const [sessionResult, setSessionResult] = useState<WorkoutSessionResult | null>(null);
    const [visible, setVisible] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);

    const hasFinishedRef = useRef(false);
    // Keep mutable refs so callbacks always see fresh values
    const timerRef = useRef(timer);
    timerRef.current = timer;
    const roundCounterRef = useRef(roundCounter);
    roundCounterRef.current = roundCounter;
    const audioRef = useRef(audio);
    audioRef.current = audio;
    // Keep a stable ref to timer.start for the stage-change effect
    const timerStartRef = useRef(timer.start);
    timerStartRef.current = timer.start;

    const showRoundCounter = config.showRoundCounter;

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
                }, delay)
            );
        });

        // Switch to active stage after "1" has been shown for 1 second
        ids.push(
            setTimeout(() => {
                setStage("active");
            }, 3000)
        );

        return () => ids.forEach(clearTimeout);
    }, []); // intentionally runs once on mount

    // Start the timer when the stage flips to 'active'
    useEffect(() => {
        if (stage === "active") {
            timerStartRef.current();
        }
    }, [stage]);

    // Collect result and move to summary when timer finishes naturally
    useEffect(() => {
        if (timer.status === "finished" && stage === "active" && !hasFinishedRef.current) {
            hasFinishedRef.current = true;
            const result = buildResult();
            setSessionResult(result);
            setStage("summary");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timer.status, stage]);

    const buildResult = useCallback((): WorkoutSessionResult => {
        const roundsCompleted = config.showRoundCounter
            ? (config.type === "AMRAP" || config.type === "FOR_TIME" ? roundCounterRef.current.rounds : config.totalRounds)
            : 0;
        return {
            totalElapsed: timerRef.current.elapsed,
            roundsCompleted,
            config,
            workoutId: workout.id,
        };
    }, [config, workout.id]);

    const handleEndWorkout = useCallback(() => {
        if (hasFinishedRef.current) return;
        hasFinishedRef.current = true;
        setShowEndConfirm(false);
        timerRef.current.stop();
        setSessionResult(buildResult());
        setStage("summary");
    }, [buildResult]);

    const onEndWorkoutClick = useCallback(() => {
        setShowEndConfirm(true);
    }, []);

    // --- Derived display values ---
    const phaseColor = timer.computed.phase === "WORK" ? WORK_COLOR : REST_COLOR;
    const phaseBadge = getPhaseBadge(config, timer.computed.phase);
    const roundLabel = getRoundLabel(config, timer.computed.round);

    const rawDisplay = timer.computed.displaySeconds;
    const displayInt = config.type === "FOR_TIME" ? Math.floor(rawDisplay) : Math.ceil(rawDisplay);
    const formattedTime = formatTime(displayInt);

    // Pulsing when near end: last 10s for countdown types, or last 10% of phase for intervals
    const isCountdown = config.type !== "FOR_TIME";
    const nearEndSeconds = isCountdown && !timer.computed.isFinished && displayInt <= 10;
    const nearEndProgress = timer.computed.phaseProgress >= 0.92 && !timer.computed.isFinished;
    const isPulsing = (nearEndSeconds || nearEndProgress) && timer.status === "running";

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ds-bg overflow-hidden select-none"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}
        >
            {/* Phase ambient glow */}
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-700"
                style={{
                    background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(245,158,11,0.11) 0%, transparent 65%)",
                    opacity: stage === "active" && timer.computed.phase === "WORK" && timer.status === "running" ? 1 : 0,
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-700"
                style={{
                    background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(96,165,250,0.11) 0%, transparent 65%)",
                    opacity: stage === "active" && timer.computed.phase === "REST" && timer.status === "running" ? 1 : 0,
                }}
            />

            {/* ─── COUNTDOWN ─── */}
            {stage === "countdown" && (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-xs uppercase tracking-widest text-ds-text-muted font-medium">
                        Get Ready
                    </p>
                    <div
                        key={countdownNum}
                        className="font-display font-black text-ds-text leading-none tabular-nums"
                        style={{
                            fontSize: "clamp(6rem, 24vw, 9rem)",
                            textShadow: "0 0 80px rgba(245,158,11,0.35)",
                            animation: "timerPulseIn 0.25s cubic-bezier(0.22,1,0.36,1) both",
                        }}
                    >
                        {countdownNum}
                    </div>
                    <p className="text-sm text-ds-text-secondary">
                        {workout.wod.type}
                        {workout.wod.duration != null && workout.wod.duration > 0 && (
                            <> · {workout.wod.duration} min</>
                        )}
                    </p>
                </div>
            )}

            {/* ─── ACTIVE TIMER ─── */}
            {stage === "active" && (
                <>
                    {/* Top bar */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest font-semibold text-ds-text-secondary">
                                {workout.wod.type}
                            </p>
                            {workout.wod.duration != null && workout.wod.duration > 0 && (
                                <p className="text-xs text-ds-text-muted">{workout.wod.duration} min</p>
                            )}
                        </div>
                        <button
                            onClick={onEndWorkoutClick}
                            className="flex items-center gap-1.5 rounded-ds-md border border-ds-border bg-ds-surface px-3 py-2 text-xs font-medium text-ds-text-muted hover:border-ds-border-strong hover:text-ds-text transition-all duration-250 focus:outline-none"
                        >
                            <X size={12} />
                            End Workout
                        </button>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col items-center gap-6 pt-16 pb-20">
                        {/* Progress ring + time display */}
                        <div
                            className={cn(
                                "relative flex items-center justify-center transition-all duration-300",
                                isPulsing && "timer-near-end-ring"
                            )}
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
                                    className={cn(
                                        "font-display font-black text-ds-text tabular-nums leading-none transition-transform duration-300",
                                        isPulsing && "timer-near-end-text"
                                    )}
                                    style={{ fontSize: "clamp(3.25rem, 14vw, 5.25rem)" }}
                                >
                                    {formattedTime}
                                </span>
                                {config.type === "FOR_TIME" && (
                                    <span className="text-[10px] text-ds-text-muted mt-0.5">Elapsed</span>
                                )}
                                {roundLabel && (
                                    <span className="text-[11px] text-ds-text-muted mt-0.5">{roundLabel}</span>
                                )}
                                {/* Paused indicator */}
                                {timer.status === "paused" && (
                                    <span className="text-[10px] uppercase tracking-widest text-ds-text-faint mt-1 animate-pulse">
                                        Paused
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Round counter + revert + pause (AMRAP / FOR_TIME) */}
                        {showRoundCounter && (
                            <div className="flex flex-col items-center gap-3 w-full max-w-[18rem]">
                                <p className="text-[10px] uppercase tracking-widest text-ds-text-muted font-medium w-full text-center">
                                    Rounds
                                </p>
                                <div className="flex items-stretch gap-2 w-full">
                                    <button
                                        onClick={roundCounter.subtractRound}
                                        aria-label="Revert round"
                                        disabled={roundCounter.rounds === 0}
                                        className="flex flex-1 items-center justify-center min-h-[4.5rem] rounded-ds-lg bg-ds-surface text-ds-text-muted shadow-ds-sm hover:bg-ds-surface-hover hover:text-ds-text disabled:opacity-35 disabled:pointer-events-none transition-all duration-200 focus:outline-none"
                                    >
                                        <RotateCcw size={20} strokeWidth={2} />
                                    </button>
                                    <div className="flex flex-1 items-center justify-center min-h-[4.5rem] rounded-ds-lg bg-ds-surface shadow-ds-sm border border-ds-border/80">
                                        <span className="text-2xl font-bold text-ds-text tabular-nums leading-none">
                                            {roundCounter.rounds}
                                        </span>
                                    </div>
                                    <button
                                        onClick={roundCounter.addRound}
                                        aria-label="Add round"
                                        className="flex flex-1 items-center justify-center min-h-[4.5rem] rounded-ds-lg bg-amber-400 text-stone-950 font-bold text-2xl tabular-nums leading-none shadow-ds-sm hover:bg-amber-300 active:scale-[0.98] transition-all duration-200 focus:outline-none"
                                    >
                                        +1
                                    </button>
                                </div>
                                <button
                                    onClick={timer.status === "running" ? timer.pause : timer.resume}
                                    className="w-full flex items-center justify-center gap-2 min-h-[2.75rem] rounded-ds-lg bg-ds-surface text-ds-text text-sm font-medium shadow-ds-sm hover:bg-ds-surface-hover transition-all duration-200 border border-ds-border/80 focus:outline-none"
                                >
                                    {timer.status === "running" ? (
                                        <>
                                            <Pause size={14} />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play size={14} />
                                            Resume
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bottom controls (EMOM / Tabata — no round counter) */}
                    {!showRoundCounter && (
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-8">
                            {timer.status === "running" ? (
                                <button
                                    onClick={timer.pause}
                                    className="flex items-center gap-2 rounded-ds-xl border border-ds-border bg-ds-surface px-7 py-3 text-sm font-medium text-ds-text hover:bg-ds-surface-hover transition-all duration-250 focus:outline-none"
                                >
                                    <Pause size={14} />
                                    Pause
                                </button>
                            ) : (
                                <button
                                    onClick={timer.resume}
                                    className="flex items-center gap-2 rounded-ds-xl border border-ds-border bg-ds-surface px-7 py-3 text-sm font-medium text-ds-text hover:bg-ds-surface-hover transition-all duration-250 focus:outline-none"
                                >
                                    <Play size={14} />
                                    Resume
                                </button>
                            )}
                        </div>
                    )}

                    {/* End workout confirmation */}
                    {showEndConfirm && (
                        <div
                            className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowEndConfirm(false)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="end-workout-title"
                        >
                            <div
                                className="mx-4 w-full max-w-xs rounded-ds-xl border border-ds-border bg-ds-surface p-5 shadow-ds-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 id="end-workout-title" className="text-lg font-semibold text-amber-400 mb-1">
                                    End workout?
                                </h3>
                                <p className="text-sm text-ds-text-muted mb-5">
                                    Your progress will be saved on the summary screen. You can save or discard from there.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEndConfirm(false)}
                                        className="flex-1 rounded-ds-xl border border-ds-border bg-ds-surface-subtle py-2.5 text-sm font-medium text-ds-text hover:bg-ds-surface-hover transition-all duration-250 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleEndWorkout}
                                        className="flex-1 rounded-ds-xl bg-amber-400 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-300 transition-all duration-250 focus:outline-none"
                                    >
                                        End workout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ─── SUMMARY ─── */}
            {stage === "summary" && sessionResult && (
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
