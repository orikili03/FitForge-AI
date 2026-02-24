import { Movement, type IMovement } from "../models/Movement.js";
import type { FitnessLevel } from "../models/User.js";
import type { Modality } from "../models/Movement.js";

// ─── Filter Input ─────────────────────────────────────────────────────────
export interface MovementFilterInput {
    /** Equipment IDs the user has available (from frontend EQUIPMENT_CATALOG) */
    availableEquipment: string[];
    /** User's fitness level */
    fitnessLevel: FitnessLevel;
    /** Optional: restrict to specific modality */
    modality?: Modality;
    /** If true, only return bodyweight movements */
    bodyweightOnly?: boolean;
    /** Optional: restrict to specific movement family */
    family?: string;
    /** Optional: require specific stimulus tag */
    stimulusTag?: string;
}

// ─── Filter Result ────────────────────────────────────────────────────────
export interface FilteredMovement {
    /** Original movement document */
    movement: IMovement;
    /** The appropriate variant name for the user's fitness level */
    resolvedName: string;
    /** Default load for the user's level (kg), if applicable */
    defaultLoadKg?: number;
}

/**
 * MovementFilterService
 *
 * Core Rules Engine service that narrows the full MovementLibrary
 * down to movements that are:
 * 1. Possible with the user's equipment
 * 2. Appropriate for the user's fitness level
 * 3. Optionally filtered by modality, family, or stimulus
 */
export class MovementFilterService {
    /**
     * Returns movements the user can perform given their equipment and level.
     */
    async filter(input: MovementFilterInput): Promise<FilteredMovement[]> {
        const query: Record<string, unknown> = {};

        // ─── Equipment Filter ───────────────────────────────────────────
        // A movement is available if:
        //   - It's bodyweight only (no equipment needed), OR
        //   - ALL its required equipment is in the user's available set
        // We fetch all candidates, then filter in-memory for the "ALL" check
        // since MongoDB $all would work but we also need bodyweight fallback.

        if (input.bodyweightOnly) {
            query.bodyweightOnly = true;
        }

        if (input.modality) {
            query.modality = input.modality;
        }

        if (input.family) {
            query.family = input.family;
        }

        if (input.stimulusTag) {
            query.stimulusTags = input.stimulusTag;
        }

        // Fetch candidates from DB
        const candidates = await Movement.find(query).lean();

        // In-memory equipment check: movement is valid if bodyweight OR
        // all required equipment is in the user's available set
        const equipmentSet = new Set(input.availableEquipment);

        const eligible = candidates.filter((m) => {
            if (m.bodyweightOnly) return true;
            if (m.equipmentRequired.length === 0) return true;
            return m.equipmentRequired.every((eq) => equipmentSet.has(eq));
        });

        // ─── Resolve variant name + load for fitness level ──────────────
        return eligible.map((m) => {
            const resolved = this.resolveForLevel(m, input.fitnessLevel);
            return {
                movement: m as unknown as IMovement,
                resolvedName: resolved.name,
                defaultLoadKg: resolved.loadKg,
            };
        });
    }

    /**
     * Given a movement and a fitness level, resolve the appropriate
     * variant name and default load.
     *
     * Logic:
     * - If a progression exists for the user's level, use that variant
     * - Otherwise fall back to the movement's base name
     * - Load comes from defaultLoadKg for the user's level
     */
    private resolveForLevel(
        movement: Record<string, unknown> & {
            name: string;
            progressions?: Array<{ level: string; variant: string }>;
            defaultLoadKg?: { beginner?: number; scaled?: number; rx?: number };
        },
        level: FitnessLevel
    ): { name: string; loadKg?: number } {
        // Check for level-specific progression variant
        const progression = movement.progressions?.find((p) => p.level === level);
        const name = progression?.variant ?? movement.name;

        // Get default load for this level
        const loadKg = movement.defaultLoadKg?.[level] ?? undefined;

        return { name, loadKg };
    }

    /**
     * Convenience: get movements grouped by modality for balanced programming.
     */
    async filterGroupedByModality(
        input: Omit<MovementFilterInput, "modality">
    ): Promise<Record<string, FilteredMovement[]>> {
        const allFiltered = await this.filter(input);

        const grouped: Record<string, FilteredMovement[]> = {
            G: [], // Gymnastics
            W: [], // Weightlifting
            M: [], // Monostructural
        };

        for (const fm of allFiltered) {
            const mod = (fm.movement as unknown as { modality: string }).modality;
            if (mod in grouped) {
                grouped[mod].push(fm);
            }
        }

        return grouped;
    }
}

// Singleton export
export const movementFilterService = new MovementFilterService();
