import type { Request, Response, Handler } from "@nxpress/core";

export async function GET(req: Request, res: Response) {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

/**
 * Route-specific middleware
 */
export const middleware: Handler = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
};

/**
 * Multiple route middlewares (optional)
 */
export const middlewares: Handler[] = [
  // cors(),
];
