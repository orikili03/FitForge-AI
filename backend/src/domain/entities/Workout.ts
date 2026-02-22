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
    /** Only for time-capped protocols (AMRAP, EMOM, TABATA, Death By); null/undefined for For Time, 21-15-9, strength. */
    duration?: number;
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
  /** Optional time domain (e.g. "<10 min", "10–20", "20+"). */
  timeDomain?: string;
  /** Optional movement emphasis tags. */
  movementEmphasis?: string[];
  /** Short stimulus/strategy note (CrossFit-style). */
  stimulusNote?: string;
  /** Preset name used when generating (e.g. "Home/Garage", "Travel"). */
  equipmentPresetName?: string;
  /** Equipment IDs used for this workout (for display and scaling alignment). */
  equipmentUsed?: string[];
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

