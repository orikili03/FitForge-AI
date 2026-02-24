import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { signToken } from "../middleware/auth.js";

const router = Router();

// ─── Validation Schemas ───────────────────────────────────────────────────
const registerSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

// ─── POST /auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
    try {
        const { email, password } = registerSchema.parse(req.body);

        // Check for existing user
        const existing = await User.findOne({ email });
        if (existing) {
            res.status(409).json({ error: "Email already registered" });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({ email, passwordHash });

        // Return token (frontend expects { token } on success)
        const token = signToken(user.id, user.email);
        res.status(201).json({ token });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.errors[0].message });
            return;
        }
        throw err;
    }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const token = signToken(user.id, user.email);
        res.json({ token });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.errors[0].message });
            return;
        }
        throw err;
    }
});

export default router;
