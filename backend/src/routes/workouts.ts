import { Router } from "express";
import { z } from "zod";
import { Workout } from "../models/Workout.js";
import { User } from "../models/User.js";
import { authGuard } from "../middleware/auth.js";
import { movementFilterService } from "../services/MovementFilterService.js";
import { varianceCheckerService } from "../services/VarianceCheckerService.js";
import { wodAssemblyService } from "../services/WodAssemblyService.js";
import type { FitnessLevel } from "../models/User.js";

const router = Router();

// All workout routes require authentication
router.use(authGuard);

// ─── Generate Request Validation ──────────────────────────────────────────
const generateSchema = z.object({
    timeCapMinutes: z.number().min(1).max(60),
    equipment: z.array(z.string()),
    protocol: z.string().default("recommended"),
    injuries: z.string().optional(),
    presetName: z.string().optional(),
});

// ─── POST /workouts/generate ──────────────────────────────────────────────
// Full pipeline: filter → variance → assemble → save → return
router.post("/generate", async (req, res) => {
    try {
        const payload = generateSchema.parse(req.body);

        // 1. Load user profile for fitness level
        const user = await User.findById(req.userId).lean();
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        // 2. Filter movements by equipment + fitness level
        const filtered = await movementFilterService.filter({
            availableEquipment: payload.equipment,
            fitnessLevel: user.fitnessLevel as FitnessLevel,
            bodyweightOnly: payload.equipment.length === 0,
        });

        if (filtered.length === 0) {
            res.status(422).json({
                error:
                    "No movements available for your equipment and fitness level. Try adding more equipment or check the Movement Library.",
            });
            return;
        }

        // 3. Analyze variance from recent history
        const variance = await varianceCheckerService.analyze(req.userId!);

        // 4. Rank movements by freshness (deprioritize recently-used families)
        const ranked = varianceCheckerService.rankByVariance(filtered, variance);

        // 5. Assemble the WOD using the template engine
        const generated = wodAssemblyService.assemble(
            ranked,
            payload.protocol,
            payload.timeCapMinutes,
            payload.presetName
        );

        // 6. Save to workout history
        const workout = await Workout.create({
            userId: req.userId,
            date: new Date(),
            type: generated.wod.type,
            durationMinutes: payload.timeCapMinutes,
            ...generated,
        });

        // 7. Return to frontend (matching WorkoutResponse schema)
        res.status(201).json({
            data: {
                id: workout.id,
                date: workout.date.toISOString(),
                type: workout.type,
                durationMinutes: workout.durationMinutes,
                completed: workout.completed,
                ...generated,
            },
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.errors[0].message });
            return;
        }
        throw err;
    }
});

// ─── GET /workouts/history ────────────────────────────────────────────────
router.get("/history", async (req, res) => {
    const workouts = await Workout.find({ userId: req.userId })
        .sort({ date: -1 })
        .lean();

    // Transform _id to id for frontend compatibility
    const data = workouts.map((w) => ({
        ...w,
        id: w._id.toString(),
        date: w.date.toISOString(),
        _id: undefined,
    }));

    res.json({ data });
});

// ─── POST /workouts/complete ──────────────────────────────────────────────
const completeSchema = z.object({
    workoutId: z.string(),
    completionTime: z.number().optional(),
    roundsOrReps: z.number().optional(),
});

router.post("/complete", async (req, res) => {
    try {
        const { workoutId, completionTime, roundsOrReps } = completeSchema.parse(req.body);

        const workout = await Workout.findOneAndUpdate(
            { _id: workoutId, userId: req.userId },
            {
                $set: {
                    completed: true,
                    ...(completionTime !== undefined && { completionTime }),
                    ...(roundsOrReps !== undefined && { roundsOrReps }),
                },
            },
            { new: true }
        );

        if (!workout) {
            res.status(404).json({ error: "Workout not found" });
            return;
        }

        res.json({ data: { success: true } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.errors[0].message });
            return;
        }
        throw err;
    }
});

// ─── DELETE /workouts/history ─────────────────────────────────────────────
router.delete("/history", async (req, res) => {
    await Workout.deleteMany({ userId: req.userId });
    res.json({ data: { success: true } });
});

export default router;
