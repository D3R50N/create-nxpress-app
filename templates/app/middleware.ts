import type { Request, Response } from "@nxpress/core";

/*
 * Application-level middlewares executed for all routes in /app
 * Any exported function is used as middleware
 */

export async function loggerMiddleware(req: Request, res: Response) {
  console.log(`[${req.method}] ${req.url}`);
  // No need to call next()
}

/**
 * example authMiddleware
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
