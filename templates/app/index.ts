import type { Request, Response } from "express";

export async function props(req: Request, res: Response) {
  let version = "1.0.8";
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
        title: "Server Data Props",
        desc: "Export props functions in route files for SSR data loading.",
        tag: "SSR Ready",
      },
      {
        title: "Tailwind CSS Integration",
        desc: "Modern styling out of the box with zero boilerplate.",
        tag: "Styling",
      },
      {
        title: "Fast Handlebars Engine",
        desc: "Dynamic server rendering with seamless layout templates.",
        tag: "Templating",
      },
    ],
  };
}
