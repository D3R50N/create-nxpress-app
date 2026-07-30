import type { Request, Response, NextFunction } from "express";

/**
 * Route-level middleware for /api/health
 */
export async function middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // API route middleware check
  next();
}

export async function GET(req: Request, res: Response) {
  return res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
