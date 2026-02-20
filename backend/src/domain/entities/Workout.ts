export interface WorkoutSpec {
  warmup: string[];
  wod: {
    type: string;
    duration: number;
    description: string;
    movements: string[];
  };
  scalingOptions: string[];
  finisher?: string[];
  intensityGuidance: string;
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

