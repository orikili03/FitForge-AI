import rateLimit from "express-rate-limit";

/**
 * Rate limit for POST /workouts/generate to reduce cost and abuse.
 * 10 requests per minute per IP (configurable via WORKOUT_GENERATE_RATE_LIMIT_MAX).
 */
const max = parseInt(process.env.WORKOUT_GENERATE_RATE_LIMIT_MAX ?? "10", 10);

export const rateLimitGenerate = rateLimit({
  windowMs: 60 * 1000,
  max: Number.isNaN(max) ? 10 : max,
  message: {
    success: false,
    error: { message: "Too many workout generation requests. Try again in a minute." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
