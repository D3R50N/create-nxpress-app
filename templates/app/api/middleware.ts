import type { Request, Response, NextFunction } from "@nxpress/core";

/**
 * Folder-level middleware applied to all /api/* routes
 */
export function apiLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
    );
  });
  next();
}
