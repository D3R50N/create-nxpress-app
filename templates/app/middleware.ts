import type { Request, Response, NextFunction } from "express";

/**
 * Application-level middleware executed for all routes in /app
 */
export async function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Add custom response headers or request logging
  res.setHeader("X-Powered-By", "Nxpress");
  next();
}

/**
 * Paths to ignore for this middleware
 */
export const ignore = ["/public", "/favicon.ico"];
