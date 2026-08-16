import type { Request, Response } from "@nxpress/core";

/**
 * Folder-level middleware applied to all /api/* routes
 * Automatically executed without needing to call next()
 */
export async function apiSecurityHeaders(req: Request, res: Response) {
  res.setHeader("X-Content-Type-Options", "nosniff");
}

/**
 * Example API key authorization check
 */
// export async function apiKeyAuth(req: Request, res: Response) {
//   const apiKey = req.headers["x-api-key"];
//   if (!apiKey && req.path !== "/api/health") {
//     res.status(401);
//     return { error: "Unauthorized: Missing API Key" };
//   }
// }
