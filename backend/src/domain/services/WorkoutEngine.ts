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
  protocol: "recommended" | "EMOM" | "AMRAP" | "FOR_TIME" | "TABATA" | "DEATH_BY" | "21_15_9";
  injuries?: string;
}

export class WorkoutEngine {
  constructor(
    private assessmentAgent: AssessmentAgent,
    private constraintAgent: ConstraintAgent,
    private progressionAgent: ProgressionAgent,
    private programmingAgent: ProgrammingAgent
  ) {}

  async generate(input: WorkoutEngineInput): Promise<WorkoutSpec> {
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

    const spec = await this.programmingAgent.program({
      assessment,
      constraints,
      progression,
      protocol: input.protocol,
      timeCapMinutes: input.timeCapMinutes,
      equipmentAvailable: input.equipment,
      injuries: input.injuries,
    });

    return spec;
  }
}

