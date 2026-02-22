# Cross MVP Architecture

This document summarizes the backend and frontend architecture, the WorkoutEngine pipeline, and the quick wins applied during the MVP optimization pass.

## High-level view

- **Backend**: Node/Express, MongoDB (Mongoose), Groq (or deterministic Simple agent) for WOD generation. Composition root in `backend/src/composition.ts` wires repos, engine, use cases, and routers.
- **Frontend**: React (Vite), React Router, TanStack Query, axios. Auth via JWT in context + localStorage.
- **Request flow**: Client → Routes → Controllers → Validators → Use Cases → Engine / Repositories → DB or LLM.

## Backend layers

| Layer | Path | Role |
|-------|------|------|
| Entry | `server.ts` | Express app, `connectMongo()`, mounts routers from composition. |
| Composition | `composition.ts` | Builds repos, engine (env-based ProgrammingAgent), use cases, controllers; exports auth, user, workout, analytics routers. |
| Application | `application/` | Use cases and DTOs. Use cases depend on domain repositories and (for generate) WorkoutEngine. |
| Domain | `domain/` | Entities, repository interfaces, WorkoutEngine, agent interfaces, config (movement catalog, equipment map, scaling, stimulus, etc.), and markdown knowledge. |
| Infrastructure | `infrastructure/` | Mongoose repos, mongoClient, models, Groq client. |
| Interfaces | `interfaces/` | Routes (as factories), controllers, Zod validators, auth and rate-limit middleware, error handler. |

## WorkoutEngine pipeline

1. **AssessmentAgent** — Fatigue and movement competency from user + recent workouts.
2. **ConstraintAgent** — Allowed/excluded movements from equipment and injuries.
3. **ProgressionAgent** — Target intensity/duration and recent exposure.
4. **ProgrammingAgent** — Produces WorkoutSpec (warmup, wod, scaling, etc.). Implementations:
   - **GroqProgrammingAgent** — LLM (Groq) with JSON output; used when `USE_GROQ !== "false"` and `GROQ_API_KEY` is set.
   - **SimpleProgrammingAgent** — Deterministic rule-based WOD; used otherwise (e.g. offline, CI, or no API key).

## Quick wins applied

- **JSON strip in GroqProgrammingAgent**: LLM response is normalized (strip markdown code fences or extract first `{` to last `}`) before `JSON.parse` to avoid 500s when the model wraps JSON.
- **Analytics use case**: `GetProgressUseCase` and `WorkoutRepository.getProgressPoints(userId)`; `AnalyticsController` calls the use case only (no direct model access).
- **Rate limiting**: `POST /workouts/generate` is rate-limited (default 10 req/min per IP; `WORKOUT_GENERATE_RATE_LIMIT_MAX` to override).
- **Composition root**: All routers are built in `composition.ts` from shared repos and an env-based ProgrammingAgent; route modules export factory functions (e.g. `createWorkoutRouter(deps)`).
- **Env-based agent**: `USE_GROQ=false` or missing `GROQ_API_KEY` → SimpleProgrammingAgent; otherwise GroqProgrammingAgent.
- **System prompt file**: GroqProgrammingAgent loads `backend/src/domain/prompts/programmingSystem.txt` at startup (with fallback to inline default). Edits to the prompt do not require code changes. Build copies the file to `dist/domain/prompts/`. Constraint added: "Allowed movement names must appear exactly as in the Allowed movements list."

## Knowledge and Coach Learning

- **Current**: `backend/src/domain/knowledge/` holds markdown (methodology, movements, scaling, workoutExamples, protocols, energySystems, movementCues) and **COACH_AGENT_OBJECTIVES.md**. These define the CrossFit Coach Agent’s learning objectives: study WODs to become an expert coach, **not** to randomly deliver workouts. The Groq system prompt is loaded from `domain/prompts/programmingSystem.txt` and is static; knowledge files are not read at runtime yet.
- **WOD references**: Structured WODs for coach learning live in `domain/knowledge/wodReferenceSchema.ts` (types) and optional JSON (e.g. `wodReferencesSample.json`) or a future DB collection. References are classified by protocol, energy system, time domain, modalities, and scaling — for analysis and synthesis only, not for random delivery.
- **References**: CrossFit methodology (what is CrossFit), Level 1 Manual (theory), [crossfit.com/workout](https://www.crossfit.com/workout) (official WOD archive), [wodwell.com/wods](https://wodwell.com/wods) (structure ideas). See `COACH_AGENT_OBJECTIVES.md` for full objectives and ingestion design.
- **Post-MVP**: RAG can embed `domain/knowledge/*.md` and optionally WOD references; at generate time retrieve 1–3 chunks by query and inject into the system or user prompt. Embeddings can be computed once (or on deploy); no per-request embed of the full corpus.

## Key API endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /auth/register | No | Register, get JWT |
| POST | /auth/login | No | Login, get JWT |
| GET | /users/me | Yes | Current user |
| PATCH | /users/me | Yes | Update profile |
| PATCH | /users/me/equipment | Yes | Update equipment |
| POST | /workouts/generate | Yes | Generate WOD (rate-limited) |
| GET | /workouts/history | Yes | List user workouts |
| POST | /workouts/complete | Yes | Mark workout complete |
| GET | /analytics/progress | Yes | Progress data (via GetProgressUseCase) |

## References

- **WOD engine audit**: [docs/WOD_ENGINE_AUDIT_AND_REFACTOR.md](WOD_ENGINE_AUDIT_AND_REFACTOR.md) — stimulus engine, pattern balance, movement catalog, warmup.
- **Extraction plan**: See Cursor plan `mvp_architecture_extraction_6dcf66de` for the full request-flow and frontend flow diagrams.
