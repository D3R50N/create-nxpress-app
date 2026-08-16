import type { Request, Response } from "@nxpress/core";

/**
 * Application-level middlewares executed for all routes in /app
 * Any exported function is automatically executed in order.
 * No need to call next()!
 */

export async function securityHeaders(req: Request, res: Response) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
}

/**
 * Example authentication middleware
 */
// export async function authMiddleware(
//   req: Request & { user?: any },
//   res: Response,
// ) {
//   if (!req.user) {
//     return res.redirect("/login");
//   }
//   if (req.user.role !== "admin") {
//     return res.redirect("/admin");
//   }
// }

/**
 * Paths to ignore for this middleware
 */
export const ignore = ["/public", "/favicon.ico"];
