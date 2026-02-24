import { Workout } from "../models/Workout.js";
import { Movement } from "../models/Movement.js";
import type { FilteredMovement } from "./MovementFilterService.js";

// ─── Variance Analysis Result ─────────────────────────────────────────────
export interface VarianceAnalysis {
    /** Movement families used recently — these should be deprioritized */
    recentFamilies: string[];
    /** Modalities used recently — for balancing G/W/M distribution */
    recentModalities: string[];
    /** Modality most underrepresented in recent history */
    suggestedModality: string | null;
    /** Number of recent workouts analyzed */
    lookbackCount: number;
}

/**
 * VarianceCheckerService
 *
 * Implements the CrossFit "Constantly Varied" principle:
 * - Analyzes the last N workouts to detect patterns
 * - Identifies overused movement families (avoid squat→squat)
 * - Tracks modality balance (G/W/M) to suggest underrepresented areas
 * - Scores candidate movements by "freshness" for better variance
 */
export class VarianceCheckerService {
    /** How many past workouts to analyze for variance */
    private readonly LOOKBACK_DAYS = 3;
    private readonly MAX_LOOKBACK_WORKOUTS = 5;

    /**
     * Analyze recent workout history for a user.
     */
    async analyze(userId: string): Promise<VarianceAnalysis> {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - this.LOOKBACK_DAYS);

        // Fetch recent workouts
        const recentWorkouts = await Workout.find({
            userId,
            date: { $gte: cutoff },
        })
            .sort({ date: -1 })
            .limit(this.MAX_LOOKBACK_WORKOUTS)
            .lean();

        // Extract movement names from recent WODs
        const recentMovementNames = new Set<string>();
        for (const w of recentWorkouts) {
            for (const m of w.wod.movements) {
                recentMovementNames.add(m.toLowerCase().trim());
            }
        }

        // Look up movement families and modalities from the Movement collection
        const movements = await Movement.find({
            name: {
                $in: Array.from(recentMovementNames).map(
                    (n) => new RegExp(`^${n}$`, "i")
                ),
            },
        })
            .select("name family modality")
            .lean();

        const recentFamilies = [
            ...new Set(movements.map((m) => m.family).filter(Boolean) as string[]),
        ];
        const recentModalities = [
            ...new Set(movements.map((m) => m.modality).filter(Boolean) as string[]),
        ];

        // Determine which modality is underrepresented
        const modalityCounts: Record<string, number> = { G: 0, W: 0, M: 0 };
        for (const m of movements) {
            if (m.modality in modalityCounts) {
                modalityCounts[m.modality]++;
            }
        }

        // Suggest the least-used modality (or null if no history)
        let suggestedModality: string | null = null;
        if (recentWorkouts.length > 0) {
            const sorted = Object.entries(modalityCounts).sort(
                ([, a], [, b]) => a - b
            );
            suggestedModality = sorted[0][0];
        }

        return {
            recentFamilies,
            recentModalities,
            suggestedModality,
            lookbackCount: recentWorkouts.length,
        };
    }

    /**
     * Score and sort candidate movements by variance "freshness."
     * Movements from recently-used families get deprioritized.
     *
     * Returns the same list of movements, sorted best-first.
     */
    rankByVariance(
        candidates: FilteredMovement[],
        analysis: VarianceAnalysis
    ): FilteredMovement[] {
        const recentFamilySet = new Set(
            analysis.recentFamilies.map((f) => f.toLowerCase())
        );

        return [...candidates].sort((a, b) => {
            const familyA = (
                (a.movement as unknown as { family?: string }).family ?? ""
            ).toLowerCase();
            const familyB = (
                (b.movement as unknown as { family?: string }).family ?? ""
            ).toLowerCase();

            const aRecent = recentFamilySet.has(familyA) ? 1 : 0;
            const bRecent = recentFamilySet.has(familyB) ? 1 : 0;

            // Prioritize movements NOT in recent families
            if (aRecent !== bRecent) return aRecent - bRecent;

            // Tie-break: prioritize the suggested modality
            if (analysis.suggestedModality) {
                const modA = (a.movement as unknown as { modality: string }).modality;
                const modB = (b.movement as unknown as { modality: string }).modality;
                const aMatch = modA === analysis.suggestedModality ? 0 : 1;
                const bMatch = modB === analysis.suggestedModality ? 0 : 1;
                if (aMatch !== bMatch) return aMatch - bMatch;
            }

            return 0;
        });
    }
}

// Singleton export
export const varianceCheckerService = new VarianceCheckerService();
