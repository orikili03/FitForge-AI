/** Per-movement reps and optional weight/distance for display. */
export interface MovementItemSpec {
  reps: number;
  name: string;
  weight?: string;
  distance?: string;
}

export interface WorkoutSpec {
  warmup: string[];
  wod: {
    type: string;
    duration: number;
    description: string;
    movements: string[];
    /** Rounds (for RFT-style); undefined when not applicable. */
    rounds?: number;
    /** Reps and optional weight/distance per movement. */
    movementItems?: MovementItemSpec[];
  };
  scalingOptions: string[];
  finisher?: string[];
  intensityGuidance: string;
  /** Optional metadata for UX (e.g. "Sprint", "Long aerobic"). */
  intendedStimulus?: string;
  /** Optional time domain (e.g. "<10 min", "10–20", "20+"). */
  timeDomain?: string;
  /** Optional movement emphasis tags. */
  movementEmphasis?: string[];
  /** Short stimulus/strategy note (CrossFit-style). */
  stimulusNote?: string;
}

export interface WorkoutProps {
  id: string;
  userId: string;
  date: Date;
  type: string;
  durationMinutes: number;
  spec: WorkoutSpec;
}

export class Workout {
  constructor(private props: WorkoutProps) {}

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  get date() {
    return this.props.date;
  }

  get type() {
    return this.props.type;
  }

  get durationMinutes() {
    return this.props.durationMinutes;
  }

  get spec() {
    return this.props.spec;
  }
}

