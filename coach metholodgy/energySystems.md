---
type: methodology_guide
description: Definitions of the three primary energy systems (Phosphagen, Glycolytic, Oxidative) and their application in CrossFit programming.
---

# Energy Systems — Coach Reference

CrossFit targets all three metabolic pathways. Classify WODs and design stimulus by energy system so programming is balanced and intentional.

## Three Pathways

1. **Phosphagen (ATP-PCr)** — 0–10 sec dominant; very high power, short duration.  
   - Example: heavy singles, short sprints, Tabata work intervals.  
   - Protocol: TABATA, heavy STRENGTH_SINGLE, short FOR_TIME (e.g. 21-15-9).

2. **Glycolytic** — 30 sec–3 min dominant; high power, burn, lactate.  
   - Example: Fran, Helen, medium AMRAPs.  
   - Protocol: FOR_TIME (short–medium), AMRAP (12–20 min), EMOM (moderate density).

3. **Oxidative (Aerobic)** — 3+ min; sustained effort, pacing.  
   - Example: Murph, long chippers, interval work with rest.  
   - Protocol: AMRAP 20+, CHIPPER, INTERVAL.

Most CrossFit WODs are **mixed**; the "primary" energy system is the one we intend to stress most (e.g. "sprint" = phosphagen–glycolytic; "long aerobic" = oxidative).

## Classification for WOD References

| Label | Typical Duration | Primary System | Coach Cue |
|-------|------------------|----------------|-----------|
| **strength** | N/A | N/A (neuromuscular) | Quality reps; full recovery. |
| **power** | Short | Phosphagen | Explosive; rest between efforts. |
| **phosphagen_sprint** | <7 min | Phosphagen–glycolytic | Go hard; finish in target window. |
| **glycolytic** | 7–20 min | Glycolytic | Sustain pace; manage burn. |
| **aerobic** | 20+ min | Oxidative | Pace; consistency over speed. |
| **mixed** | Varies | Two or more | Depends on structure (e.g. interval = aerobic + power). |
| **skill** | Varies | N/A | Mechanics first; low density. |

## Use in Coach Learning

- When **storing** a WOD from an archive, assign `energySystem` from protocol + duration + rep scheme.
- When **generating**, `stimulusEngine` already maps time cap and goal to stimulus; align protocol and rep ranges to that energy system so the athlete gets the intended training effect.
