import { MongooseUserRepository } from "./infrastructure/repositories/MongooseUserRepository";
import { MongooseWorkoutRepository } from "./infrastructure/repositories/MongooseWorkoutRepository";
import { WorkoutEngine } from "./domain/services/WorkoutEngine";
import {
  SimpleAssessmentAgent,
  SimpleConstraintAgent,
  SimpleProgressionAgent,
  SimpleProgrammingAgent,
} from "./domain/services/impl/SimpleAgents";
import { GroqProgrammingAgent } from "./domain/services/impl/GroqProgrammingAgent";
import { ProgrammingAgent } from "./domain/services/aiAgents";
import { createAuthRouter } from "./interfaces/routes/authRoutes";
import { createUserRouter } from "./interfaces/routes/userRoutes";
import { createWorkoutRouter } from "./interfaces/routes/workoutRoutes";
import { createAnalyticsRouter } from "./interfaces/routes/analyticsRoutes";

const userRepo = new MongooseUserRepository();
const workoutRepo = new MongooseWorkoutRepository();

const useGroq = process.env.USE_GROQ !== "false" && !!process.env.GROQ_API_KEY;
const programmingAgent: ProgrammingAgent = useGroq
  ? new GroqProgrammingAgent()
  : new SimpleProgrammingAgent();

const engine = new WorkoutEngine(
  new SimpleAssessmentAgent(),
  new SimpleConstraintAgent(),
  new SimpleProgressionAgent(),
  programmingAgent
);

export const authRouter = createAuthRouter(userRepo);
export const userRouter = createUserRouter(userRepo);
export const workoutRouter = createWorkoutRouter({ userRepo, workoutRepo, engine });
export const analyticsRouter = createAnalyticsRouter(workoutRepo);
