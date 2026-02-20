import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation error",
        details: err.flatten(),
      },
    });
  }

  const statusCode = err.statusCode || 500;

  // eslint-disable-next-line no-console
  console.error(err);

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal server error",
      details: err.details,
    },
  });
};

