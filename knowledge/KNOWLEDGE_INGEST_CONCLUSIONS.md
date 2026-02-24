# WOD Knowledge Base — Ingest Conclusions

This document summarizes the ingestion of WODs from external sources into the knowledge folder and how to re-run or extend it.

## What Was Done

### CrossFit.com/workout — **Success**

- **Source**: [CrossFit's Workout of the Day](https://www.crossfit.com/workout) (official archive).
- **Method**: Node script `backend/scripts/ingestCrossFitWods.ts` fetches one month per request (`/workout/YYYY/MM`), parses HTML with Cheerio, and extracts each day's block (date, main workout text, Scaling, Intermediate/Beginner options).
- **Output**: Merged into `wodReferences.json` in this folder. Existing entries in `wodReferencesSample.json` are kept (by id); newly fetched WODs are appended. No duplicate ids.
- **Count**: As of the last run, **2,245** WOD references (Jan 2020 – Feb 2026). About **2,241** were fetched; **4** came from the hand-curated sample (those four retain full movement breakdowns).
- **Schema**: Each entry conforms to `WODReference` in `wodReferenceSchema.ts`: id, source, sourceDate, sourceUrl, protocol, protocolDescription, durationMinutes, timeDomain, energySystem, movements (empty for fetched; sample entries have full movement lists), modalities, patterns, equipment, scalingTiers, stimulusNote.
- **Protocol/energy inference**: Heuristic rules map text to `WODProtocol` (AMRAP, FOR_TIME, STRENGTH_SINGLE, etc.) and to `TimeDomainBucket` / `EnergySystem`. Modalities and patterns are inferred from movement keywords.
- **Rate limiting**: 1.5 s delay between requests to avoid overloading the server.

## Files in This Folder

| File | Purpose |
|------|--------|
| `wodReferences.json` | **Primary dataset** — merged CrossFit.com + sample. Use this for RAG, analysis, or variety stats. |
| `wodReferencesSample.json` | Hand-curated seed (4 WODs with full movement breakdowns). Used as initial merge base by the ingest script. |
| `wodReferenceSchema.ts` | TypeScript types for `WODReference`, `WODMovementRef`, `WODReferenceSummary`. |
| `KNOWLEDGE_INGEST_CONCLUSIONS.md` | This file. |

## How to Re-run or Extend

### Re-run CrossFit.com ingest

From the repo root:

```bash
cd backend
npx ts-node scripts/ingestCrossFitWods.ts
```

- Reads `wodReferencesSample.json` and fetches all months (2020-01 through 2026-02).
- Merges by id: existing ids are kept (sample wins), new ids are added.
- Writes `src/domain/knowledge/wodReferences.json`.

To fetch only the last N months (e.g. 12), set `MONTH_LIMIT = 12` in the script and run again.

### Add more WODs by hand

Append or merge into `wodReferencesSample.json` (or into `wodReferences.json` and then run the script with a small range so it doesn’t overwrite). Keep ids unique (e.g. `crossfit-YYMMDD` or `wodwell-<slug>`).

### Use the data

- **RAG / prompt injection**: Load `wodReferences.json`, filter by protocol/time domain/equipment, and inject 1–3 examples or summaries into the programming agent prompt.
- **Variety stats**: Compute `WODReferenceSummary` (by protocol, time domain, energy system, modality) to guide balance in generation.
- **Movement extraction**: Fetched entries have `movements: []`. A follow-up pass (e.g. LLM or regex on `protocolDescription`) could populate movements for more WODs.
