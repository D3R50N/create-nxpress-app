import type { Request, Response, NextFunction, Handler } from "@nxpress/core";

export async function get(req: Request, res: Response) {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

/**
 * Single route middleware
 */
export async function middleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("middleware executed for /api/health");
}

/**
 * Multiple route middlewares
 */
export const middlewares: Handler[] = [
  // cors(),
  // ...
];
