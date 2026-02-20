import { User } from "../entities/User";
import { WorkoutSpec } from "../entities/Workout";
import {
  AssessmentAgent,
  ConstraintAgent,
  ProgressionAgent,
  ProgrammingAgent,
} from "./aiAgents";

export interface WorkoutEngineInput {
  user: User;
  equipment: string[];
  timeCapMinutes: number;
  recentWorkouts: WorkoutSpec[];
  fatigueScore?: number;
  goal: "strength" | "endurance" | "mixed" | "skill";
}

export class WorkoutEngine {
  constructor(
    private assessmentAgent: AssessmentAgent,
    private constraintAgent: ConstraintAgent,
    private progressionAgent: ProgressionAgent,
    private programmingAgent: ProgrammingAgent
  ) {}

  generate(input: WorkoutEngineInput): WorkoutSpec {
    const assessment = this.assessmentAgent.assess({
      user: input.user,
      recentWorkouts: input.recentWorkouts,
    });

    const constraints = this.constraintAgent.evaluate({
      user: input.user,
      timeCapMinutes: input.timeCapMinutes,
      equipmentAvailable: input.equipment,
    });

    const progression = this.progressionAgent.evaluate({
      user: input.user,
      history: input.recentWorkouts,
    });

    const spec = this.programmingAgent.program({
      assessment,
      constraints,
      progression,
      primaryGoal: input.goal,
    });

    return spec;
  }
}

