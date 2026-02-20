export type WorkoutTimerType = 'EMOM' | 'AMRAP' | 'FOR_TIME' | 'TABATA';

export type TimerPhase = 'WORK' | 'REST';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface TimerConfig {
  type: WorkoutTimerType;
  /** Number of intervals/rounds (0 = user-tracked, as in AMRAP/FOR_TIME) */
  totalRounds: number;
  workSeconds: number;
  restSeconds: number;
  /** Total session duration in seconds; used as countdown for AMRAP or time-cap for FOR_TIME */
  durationSeconds: number;
}

export interface ComputedTimerState {
  round: number;
  phase: TimerPhase;
  /** Large number shown to user: remaining seconds for countdown types, elapsed for FOR_TIME */
  displaySeconds: number;
  /** 0-1 progress for the ring — always increases within a phase */
  phaseProgress: number;
  isFinished: boolean;
}

export interface WorkoutSessionResult {
  totalElapsed: number;
  /** Rounds completed (user-tracked for AMRAP/For Time; protocol total for EMOM/Tabata) */
  roundsCompleted: number;
  config: TimerConfig;
  workoutId: string;
}
