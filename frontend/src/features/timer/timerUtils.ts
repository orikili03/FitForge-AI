import type { WorkoutResponse } from '../workouts/workoutApi';
import type { TimerConfig, ComputedTimerState } from './timerTypes';

/**
 * Derive a TimerConfig from the workout spec.
 * Falls back to FOR_TIME for any unrecognised workout type string.
 */
export function parseTimerConfig(workout: WorkoutResponse): TimerConfig {
  const typeStr = workout.wod.type.toUpperCase();
  const durationSeconds = Math.max(60, workout.wod.duration * 60);

  if (typeStr.includes('TABATA')) {
    // Classic Tabata: 8 rounds × (20s work + 10s rest) = 4 min
    return { type: 'TABATA', totalRounds: 8, workSeconds: 20, restSeconds: 10, durationSeconds: 240 };
  }

  if (typeStr.includes('EMOM')) {
    // Each minute is one round
    const rounds = Math.max(1, workout.wod.duration);
    return { type: 'EMOM', totalRounds: rounds, workSeconds: 60, restSeconds: 0, durationSeconds };
  }

  if (typeStr.includes('AMRAP')) {
    // Single countdown; user tracks rounds/reps manually
    return { type: 'AMRAP', totalRounds: 0, workSeconds: 0, restSeconds: 0, durationSeconds };
  }

  // Default: For Time — count up, stop when done (time cap = duration)
  return { type: 'FOR_TIME', totalRounds: 0, workSeconds: 0, restSeconds: 0, durationSeconds };
}

/**
 * Pure function — compute all display values from raw elapsed time + config.
 * This makes the timer purely derivable and easy to test.
 */
export function computeTimerState(elapsed: number, config: TimerConfig): ComputedTimerState {
  const e = Math.max(0, elapsed);

  switch (config.type) {
    case 'TABATA': {
      const roundDur = config.workSeconds + config.restSeconds;
      const totalDur = config.totalRounds * roundDur;

      if (e >= totalDur) {
        return { round: config.totalRounds, phase: 'REST', displaySeconds: 0, phaseProgress: 1, isFinished: true };
      }

      const roundIndex = Math.floor(e / roundDur);
      const withinRound = e - roundIndex * roundDur;

      if (withinRound < config.workSeconds) {
        const rem = config.workSeconds - withinRound;
        return {
          round: roundIndex + 1, phase: 'WORK',
          displaySeconds: rem,
          phaseProgress: (config.workSeconds - rem) / config.workSeconds,
          isFinished: false,
        };
      }

      const rem = roundDur - withinRound;
      return {
        round: roundIndex + 1, phase: 'REST',
        displaySeconds: rem,
        phaseProgress: (config.restSeconds - rem) / config.restSeconds,
        isFinished: false,
      };
    }

    case 'EMOM': {
      const totalDur = config.totalRounds * config.workSeconds;

      if (e >= totalDur) {
        return { round: config.totalRounds, phase: 'WORK', displaySeconds: 0, phaseProgress: 1, isFinished: true };
      }

      const roundIndex = Math.floor(e / config.workSeconds);
      const withinRound = e - roundIndex * config.workSeconds;
      const rem = config.workSeconds - withinRound;

      return {
        round: roundIndex + 1, phase: 'WORK',
        displaySeconds: rem,
        phaseProgress: (config.workSeconds - rem) / config.workSeconds,
        isFinished: false,
      };
    }

    case 'AMRAP': {
      const rem = Math.max(0, config.durationSeconds - e);
      return {
        round: 1, phase: 'WORK',
        displaySeconds: rem,
        phaseProgress: Math.min(e / config.durationSeconds, 1),
        isFinished: rem <= 0,
      };
    }

    case 'FOR_TIME': {
      const cap = config.durationSeconds;
      const isFinished = cap > 0 && e >= cap;
      return {
        round: 1, phase: 'WORK',
        displaySeconds: e,
        phaseProgress: cap > 0 ? Math.min(e / cap, 1) : 0,
        isFinished,
      };
    }
  }
}

/** Format seconds → "MM:SS" */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const secs = s % 60;
  return `${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** Whether this timer type uses a manual rep counter */
export function needsRepCounter(type: TimerConfig['type']): boolean {
  return type === 'AMRAP' || type === 'FOR_TIME';
}

/** Label for the phase shown inside the ring */
export function getPhaseBadge(config: TimerConfig, phase: 'WORK' | 'REST'): string {
  if (config.type === 'AMRAP') return 'AMRAP';
  if (config.type === 'FOR_TIME') return 'FOR TIME';
  return phase;
}

/** Sub-label beneath the time (round indicator) */
export function getRoundLabel(config: TimerConfig, round: number): string {
  if (config.type === 'EMOM') return `Minute ${round} / ${config.totalRounds}`;
  if (config.type === 'TABATA') return `Round ${round} / ${config.totalRounds}`;
  return '';
}
