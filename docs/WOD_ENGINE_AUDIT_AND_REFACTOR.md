# FitForge AI – WOD Engine Audit & Refactor

## 1. Audit Summary

### What was reviewed

- **WOD generation pipeline**: `WorkoutEngine` → Assessment → Constraint → Progression → Programming
- **Implementation**: `SimpleAgents.ts` (assessment, constraint, progression, programming)
- **Domain config**: `movementTags.ts`, `scalingRules.ts`, `equipmentMovementMap.ts`
- **Schema**: `Workout.ts`, `WorkoutDTO.ts`, API and frontend consumption

### Findings

| Area | Finding | Severity |
|------|---------|----------|
| **Randomness** | No `Math.random` in workout generation. Selection was already deterministic (sort by exposure, take first N). | ✅ None |
| **Movement selection** | Movement pools were goal-based (strength/gymnastics/mono/mixed) but **no per-workout pattern balance** – e.g. three pulls or three hinges in one WOD was possible. | Medium |
| **Protocol & duration** | Protocol was rule-based (`pickRecommendedProtocol`) but **duration was a separate bracket logic**; no single “intended stimulus” driving both. | Medium |
| **Stimulus** | `intendedStimulus` was derived *after* the fact from duration/goal; **stimulus did not drive** protocol or duration. | Medium |
| **Fatigue** | Fatigue reduced duration and influenced protocol but **did not explicitly drive recovery stimulus** (e.g. “Recovery-friendly; steady pace”). | Low |
| **Warmup** | Always `[]` – no movement-based warmup suggestions. | Low |
| **Single source of truth** | Movement lists and domain/pattern maps duplicated between `movementTags` and `SimpleAgents` (`MOVEMENT_CATEGORIES`). | Medium |
| **Scalability** | Adding new movements required edits in multiple files. | Low |

### What was already solid

- Clear agent pipeline (assessment → constraints → progression → programming)
- Equipment and injury constraints applied before selection
- Recent exposure (by domain and pattern) used to prefer under-used movements
- Protocol selection rules (time cap, goal, strength vs endurance)
- No arbitrary randomness; deterministic behavior

---

## 2. Refactor Actions

### What was changed

| Change | Why | Effect |
|--------|-----|--------|
| **Central movement catalog** (`movementCatalog.ts`) | Single source for movement ID, domain, patterns, primary pattern, suggested weight. | One place to add movements; consistent taxonomy for balance and scaling. |
| **Stimulus engine** (`stimulusEngine.ts`) | Decides **intended stimulus** from time cap, goal, progression, fatigue. Outputs: stimulus type, duration, recommended protocol, movement count, human-readable label. | Protocol and duration are driven by intended stimulus; recovery gets explicit “Recovery-friendly” stimulus. |
| **Pattern balance** (`patternBalance.ts`) | Selects up to N movements with **max 2 per primary pattern** and preference for lower recent exposure. | Avoids stacking same pattern (e.g. three pulls); more balanced, CrossFit-style WODs. |
| **Programming agent refactor** | Uses `decideStimulus()` for duration and protocol when “Recommended”; uses `selectBalancedMovements()` instead of in-house “pick by exposure”; uses catalog for weights and movement pools. | Stimulus-driven, pattern-balanced, single source of truth. |
| **Warmup suggestions** | Rule-based warmup from selected movements (cardio, hip/ankle, pull prep, push prep). | Every generated WOD now has a short warmup list. |
| **movementTags** | Re-exports domain/pattern from catalog; `computeRecentExposure` uses catalog. | No duplicate maps; one taxonomy. |
| **Constraint agent** | Allowed movements = equipment set (as array) minus excluded. Uses catalog via equipment map. | Simpler and consistent with catalog. |

### What was not changed

- API contract (`GenerateWorkoutRequestDTO`, `WorkoutResponseDTO`, `WorkoutSpec`)
- Frontend generate flow or routing
- Assessment / Progression logic (fatigue score, target intensity/duration) beyond their use in stimulus
- Scaling rules or equipment map structure (only movement list aligned with catalog)

---

## 3. Programming Engine Improvements (Implemented)

- **Stimulus model**  
  - Types: sprint, short_metcon, medium_metcon, long_aerobic, strength_bias, skill.  
  - Same inputs (time cap, goal, progression, fatigue) → same stimulus and duration.

- **Movement pattern balance**  
  - Per-workout cap (e.g. max 2 per primary pattern); prefer spread across push/pull/squat/hinge/locomotion.  
  - Fallback when pool is small so selection always returns up to N movements.

- **Protocol selection**  
  - When user selects “Recommended”, protocol comes from `stimulusEngine` (e.g. FOR_TIME for sprint, AMRAP for long aerobic, EMOM for strength/skill).

- **Fatigue/recovery**  
  - High fatigue → recovery stimulus: shorter duration, “Recovery-friendly” label, FOR_TIME, 2 movements.

- **Progression awareness**  
  - Progression (target duration, recent exposure) feeds stimulus and movement count; exposure feeds pattern balance and variation over time.

- **Warmup**  
  - Derived from selected movements (modality and patterns): e.g. row/run → light cardio; squat/hinge → mobility + squats; pull → band work; push → shoulder prep.

---

## 4. Engineering Improvements

- **Cleaner architecture**  
  - Domain config: `movementCatalog`, `stimulusEngine`, `patternBalance`, `movementTags` (re-export), `scalingRules`, `equipmentMovementMap`.  
  - Agents depend on config; no duplicated movement lists.

- **Abstractions**  
  - Stimulus: `decideStimulus()` – pure function, easy to test.  
  - Balance: `selectBalancedMovements()` – pure, deterministic.  
  - Catalog: `getDomain`, `getPatterns`, `getPrimaryPattern`, `getSuggestedWeight`, `MOVEMENTS_BY_DOMAIN`.

- **Schema**  
  - `WorkoutSpec` already had `intendedStimulus`, `timeDomain`, `stimulusNote`, `movementEmphasis`, `warmup`.  
  - No breaking changes; frontend can show warmup and intended stimulus (e.g. on Generate result and Today WOD).

- **Reusability**  
  - New movements: add one entry in `movementCatalog`; add scaling in `scalingRules` and equipment in `equipmentMovementMap`.  
  - New stimulus type: extend `StimulusType` and `decideStimulus` branches.

---

## 5. High-Value Suggestions (Future)

- **Coach Brain module**  
  - Optional higher-level “week plan”: e.g. Mon strength, Tue short metcon, Wed skill, Thu long aerobic, Fri recovery.  
  - Generator could take “day type” or “week context” and bias stimulus accordingly.

- **Movement pattern tracker**  
  - Persist recent exposure (by pattern/domain) per user and use across sessions (e.g. last 7 days) so variation is consistent even with sparse history.

- **Weekly programming logic**  
  - If history is available for the week, avoid repeating same stimulus on consecutive days; prefer rotation of strength / metcon / skill / aerobic.

- **Scaling logic**  
  - Tie scaling to user level (beginner/intermediate/advanced) and movement: e.g. suggest “ring rows” for pull-up only when level is beginner, not as a generic list.

- **Rep schemes**  
  - Expand protocol-specific rep schemes (e.g. 18-15-12, 5-5-5-5) from rules (time domain, movement count) rather than fixed arrays, while staying deterministic.

- **Tests**  
  - Fix Jest/TypeScript setup (`@types/jest`, tsconfig types).  
  - Add unit tests for `decideStimulus`, `selectBalancedMovements`, and programming agent (e.g. stimulus label present, warmup length, pattern spread).

---

## File Summary

| File | Role |
|------|------|
| `backend/src/domain/config/movementCatalog.ts` | **New.** Single source: movement ID, domain, patterns, primary pattern, weight. |
| `backend/src/domain/config/stimulusEngine.ts` | **New.** Stimulus type, duration, protocol, movement count, label from goal/fatigue/time cap. |
| `backend/src/domain/config/patternBalance.ts` | **New.** Select N movements with pattern balance and exposure preference. |
| `backend/src/domain/config/movementTags.ts` | **Updated.** Uses catalog; re-exports types; `computeRecentExposure` uses catalog. |
| `backend/src/domain/services/impl/SimpleAgents.ts` | **Refactored.** Stimulus-driven duration/protocol; pattern-balanced selection; catalog; warmup. |
| `frontend/src/pages/GenerateWorkoutPage.tsx` | **Updated.** Shows intended stimulus, stimulus note, and warmup in result panel. |

No breaking changes to API or stored workout shape. Backend TypeScript compiles; existing tests remain as-is (Jest env issues are pre-existing).
