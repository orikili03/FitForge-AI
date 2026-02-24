import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// ─── Evolution-Friendly Auth Guard ────────────────────────────────────────
// Today: JWT verification from Authorization header.
// Tomorrow: Swap to Clerk/Auth0 webhook verification by changing only this file.
// ──────────────────────────────────────────────────────────────────────────

export interface AuthPayload {
    sub: string; // userId
    email: string;
}

// Extend Express Request to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function authGuard(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }

    const token = header.slice(7); // Remove "Bearer "

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
        req.userId = decoded.sub;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
}

export function signToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
}
