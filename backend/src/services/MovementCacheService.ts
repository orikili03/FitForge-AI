import { Movement, type IMovement } from "../models/Movement.js";

/**
 * MovementCacheService
 * 
 * In-memory cache for the entire Movement Library.
 * Since the movement catalog is relatively small and static,
 * keeping it in memory eliminates hundreds of database round-trips.
 */
export class MovementCacheService {
    private cache: IMovement[] | null = null;
    private lastFetch: number = 0;
    private readonly TTL_MS = 1000 * 60 * 60; // 1 hour

    /**
     * Get all movements, using cache if available and fresh.
     */
    async getAll(): Promise<IMovement[]> {
        const now = Date.now();
        if (this.cache && (now - this.lastFetch < this.TTL_MS)) {
            return this.cache;
        }

        console.log("🔄 Movement Library Cache MISS - Fetching from DB...");
        this.cache = await Movement.find({}).lean() as unknown as IMovement[];
        this.lastFetch = now;
        return this.cache;
    }

    /**
     * Force refresh the cache (e.g. after seeding or library updates).
     */
    async refresh(): Promise<void> {
        this.cache = null;
        await this.getAll();
    }

    /**
     * Find movements by specific criteria in-memory.
     */
    async find(filter: (m: IMovement) => boolean): Promise<IMovement[]> {
        const all = await this.getAll();
        return all.filter(filter);
    }
}

export const movementCacheService = new MovementCacheService();
