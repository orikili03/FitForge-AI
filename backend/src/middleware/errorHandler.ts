import type { Request, Response, NextFunction } from "express";

/**
 * Global error handler.
 * Catches unhandled errors and returns a clean JSON response.
 */
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error("❌ Unhandled error:", err.message);

    const statusCode = (err as Error & { statusCode?: number }).statusCode ?? 500;

    res.status(statusCode).json({
        error: err.message || "Internal server error",
    });
}
