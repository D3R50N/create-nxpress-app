import type { Request, Response } from "@nxpress/core";

/**
 * Route metadata export for SEO
 */
export const metadata = {
  title: "Nxpress - Fast Fullstack Node.js Framework",
  description: "Modern web framework with file-based routing, SSR and static site generation.",
  openGraph: {
    title: "Nxpress Framework",
    description: "Build fast with file-based routing and SSR.",
  },
};

/**
 * Route data loader
 */
export default async function props(req: Request, res: Response) {
  let version = "1.3.0";
  try {
    const f = await fetch("https://registry.npmjs.org/@nxpress/core/latest");
    version = (await f.json()).version;
  } catch (err) {
    console.error("Getting Nxpress version failed.", err);
  }

  return {
    version,
    features: [
      {
        title: "File-Based Routing",
        desc: "Automatic route handling mapped to the app directory structure.",
      },
      {
        title: "Internationalization (i18n)",
        desc: "Multi-language routing with automatic translation dictionaries & SSR.",
      },
      {
        title: "Static Site Generation (SSG)",
        desc: "Export blazingly fast pre-rendered HTML with nxpress export.",
      },
      {
        title: "Multi-Engine Templating",
        desc: "Built-in support for EJS (Eta), Handlebars, Nunjucks, LiquidJS & HTML.",
      },
    ],
  };
}
