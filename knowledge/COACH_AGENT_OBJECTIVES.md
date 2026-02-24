# CrossFit Coach Agent — Objectives & Design

The Coach Agent is a **CrossFit Coach AI Agent** that continuously learns, analyzes, and improves coaching expertise by combining:

1. **Default CrossFit knowledge**: movement standards, programming principles, methodology, energy systems, protocols, and scaling.
2. **User-specific data** collected over time: recent WODs, fatigue, movement competency, target intensity/duration, exposure by domain and pattern, equipment, injuries, and — where available — WOD performance (scores, times, reps, weights, movement proficiency, fatigue patterns, recovery metrics).

**With every generated WOD, the agent considers both.** It does not randomly deliver workouts; it produces principled, stimulus-appropriate workouts tailored to the athlete using methodology and individual context.

## Official References (Study & Internalize)

- **CrossFit definition & methodology**: https://www.crossfit.com/what-is-crossfit  
- **CrossFit Level 1 Training Manual** (theory): https://www.crossfit.com/cf-seminars/CertRefs/CF_Manual_v4.pdf  
- **Official WOD archive**: https://www.crossfit.com/workout  
- **WOD database (structure ideas)**: https://wodwell.com/wods  

## Objectives

1. **Fetch and study WODs** from the official archive and databases. Analyze each for structure, movements, scaling, and methodology.
2. **Classify each WOD** by:
   - **Protocols**: AMRAP, For Time, EMOM, Chipper, Ladder, Interval, Strength, etc. (see `protocols.md`)
   - **Energy systems**: Strength, power, phosphagen sprint, glycolytic, aerobic, mixed, skill (see `energySystems.md`)
   - **Equipment**: Barbell, dumbbell, rower, bike, pull-up bar, etc.
   - **Scaling**: Beginner, intermediate, advanced (Rx) options
3. **Internalize movement standards**: Coach-level cues, SOPs, and CrossFit-approved technique (see `movementCues.md`, `movements.md`, `scaling.md`).
4. **Analyze balance and variety**:
   - **Movement domains**: Gymnastics, Weightlifting, Monostructural
   - **Time domains**: Short (<7 min), Medium (7–20 min), Long (20+ min)
   - **Intensity/pattern domains**: Push, Pull, Squat, Hinge, Core, Locomotion, Carry
5. **Develop coaching intelligence**: Recognize programming patterns, progression logic, scaling logic, and how to design balanced, functional fitness programming.

## Key Rules

- **Consider all with each generated WOD**: Combine CrossFit knowledge (movement standards, protocols, scaling, energy systems) and user-specific data (recent WODs, fatigue, exposure, equipment, injuries, performance) on every request.
- **Do not randomly deliver WODs.** Use learned intelligence and athlete context to generate **tailored**, **principled** WODs via: `WorkoutEngine` → Assessment → Constraint → Progression → **ProgrammingAgent** (Vertex AI Gemini or Simple).
- **Store WODs in structured format** (see `wodReferenceSchema.ts`) for deep analysis and synthesis; coach-learning augments what the agent knows (protocols, scaling, balance).

## Storage & Ingestion (Design)

- **Schema**: `WODReference` in `domain/knowledge/wodReferenceSchema.ts` — id, source, protocol, timeDomain, energySystem, movements, modalities, patterns, equipment, scalingTiers, stimulusNote.
- **Storage**: WOD references can live as:
  - **Static JSON/Markdown** in `domain/knowledge/` (curated examples, benchmark set).
  - **Optional DB collection** (e.g. `wod_references`) if ingesting at scale from CrossFit.com or WODwell.
- **Ingestion**: Out of scope for MVP; can be a script or background job that:
  - Fetches from CrossFit.com/workout (or API if available).
  - Parses protocol, movements, scaling, stimulus note.
  - Maps movements to `movementCatalog` IDs/patterns where possible.
  - Writes `WODReference[]` to file or DB.
- **Synthesis**: Programming agent (and future RAG) can use:
  - `protocols.md`, `energySystems.md`, `movementCues.md`, `methodology.md`, `workoutExamples.md` as prompt or retrieval context.
  - Optional: aggregate stats (`WODReferenceSummary`) to ensure variety (e.g. not over-representing one protocol).

## User-Specific Data (Considered with Each WOD)

The programming agent receives derived and contextual data on every generate request:

| Data | Source | Used for |
|------|--------|----------|
| Recent WODs (specs) | WorkoutRepository.listHistory | Exposure by domain/pattern, fatigue proxy |
| Fatigue score | AssessmentAgent (from recent volume) | Recovery-friendly stimulus, duration |
| Movement competency | AssessmentAgent (from user.fitnessLevel) | Scaling, load, complexity |
| Target intensity/duration | ProgressionAgent (from history volume) | Protocol and stimulus choice |
| Allowed/excluded movements | ConstraintAgent (equipment, injuries, constraints) | Movement list and scaling |
| Time cap, protocol, injuries | Request | Protocol, duration, substitutions |

Future: completion data (scores, times, rounds, weights) and recovery metrics can be passed in or summarized so the agent can further tailor to performance trends and movement proficiency.

## Integration with Existing System

| Component | Role |
|----------|------|
| **stimulusEngine** | Decides intended stimulus (sprint, short_metcon, long_aerobic, strength_bias, skill) from time cap, progression, fatigue. |
| **movementCatalog** | Single source for movement ID, domain, patterns; used by balance and constraints. |
| **patternBalance** | Selects movements with max 2 per primary pattern; prefers variety. |
| **programmingSystem.txt** | System prompt for VertexProgrammingAgent; can reference coach knowledge (methodology, protocols, scaling). |
| **domain/knowledge/*.md** | Methodology, movements, scaling, examples, protocols, energy systems, cues. Not yet loaded at runtime; candidate for RAG or prompt injection. |

Coach-learning adds: **structured WOD references** and **explicit protocol/energy-system taxonomy** so that when the agent programs, it does so with the same classification and balance logic used in the official archive.
