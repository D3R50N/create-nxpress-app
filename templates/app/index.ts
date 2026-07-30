import type { Request, Response, NextFunction, Handler } from "express";

/**
 * Route data loader
 * Should be the default export of the route file or named `props`
 */
export default async function props(req: Request, res: Response) {
  let version = "1.2.0";
  try {
    const f = await fetch("https://registry.npmjs.org/@nxpress/core/latest");
    version = (await f.json()).version;
  } catch (err) {
    console.error("Getting Nxpress version failed.", err);
  }
  return {
    title: "Nxpress Framework",
    version: version,
    description: "Express.js speed with Next.js developer experience.",
    features: [
      {
        title: "File-Based Routing",
        desc: "Automatic route handling mapped to the app directory structure.",
        tag: "Zero Config",
      },
      {
        title: "Folder & Route Middleware",
        desc: "Powerful middleware support with auto-loading middleware.ts.",
        tag: "Middleware",
      },
      {
        title: "Server Data Props",
        desc: "Export props functions in route companion files for SSR data loading.",
        tag: "SSR Ready",
      },
      {
        title: "Multi-Engine Templating",
        desc: "Built-in support for EJS (Eta), Handlebars, Nunjucks, LiquidJS & HTML.",
        tag: "Templating",
      },
    ],
  };
}

/**
 * Route-level middleware for index page
 */
export async function middleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("middleware executed for page index");
}

/**
 * Multiple route middlewares
 */
export const middlewares: Handler[] = [];
