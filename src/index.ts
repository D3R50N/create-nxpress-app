#!/usr/bin/env node

import {
  intro,
  outro,
  text,
  select,
  confirm,
  spinner,
  isCancel,
  cancel,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";

const program = new Command();

program
  .name("create-nxpress-app")
  .description("Scaffold a new Nxpress project")
  .argument("[project-directory]", "Directory for the project")
  .option("-e, --engine <engine>", "Template engine (handlebars, ejs, html)")
  .option("-p, --port <number>", "Port number")
  .option("--tailwind", "Include Tailwind CSS support", true)
  .option("--app-dir <dir>", "Directory for application routes")
  .option("--components-dir <dir>", "Directory for components")
  .option("--public-dir <dir>", "Directory for static assets")
  .option("--skip-install", "Skip installing dependencies", false)
  .action(async (projectDirArg, options) => {
    console.log();
    intro(chalk.bgCyan.black(" Create Nxpress App "));

    let projectDir = projectDirArg;
    if (!projectDir) {
      const res = await text({
        message: "Where would you like to create your project?",
        placeholder: "my-nxpress-app",
        defaultValue: "my-nxpress-app",
      });
      if (isCancel(res)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
      projectDir = res;
    }

    const targetPath = path.resolve(process.cwd(), projectDir);

    if (fs.existsSync(targetPath) && fs.readdirSync(targetPath).length > 0) {
      const overwrite = await confirm({
        message: `Directory ${chalk.cyan(projectDir)} is not empty. Continue anyway?`,
        initialValue: false,
      });
      if (isCancel(overwrite) || !overwrite) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
    }

    let engine = options.engine;
    if (!engine || !["handlebars", "ejs", "html"].includes(engine)) {
      const selectedEngine = await select({
        message: "Which template engine do you want to use?",
        options: [
          {
            value: "handlebars",
            label: "Handlebars (Recommended)",
            hint: "Clean syntax & partials",
          },
          { value: "ejs", label: "EJS", hint: "Embedded JavaScript templates" },
          { value: "html", label: "HTML", hint: "Plain HTML templates" },
        ],
      });
      if (isCancel(selectedEngine)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
      engine = selectedEngine as string;
    }

    let port = options.port ? parseInt(options.port, 10) : 3000;
    if (process.stdin.isTTY && !options.port) {
      const portRes = await text({
        message: "Port number:",
        placeholder: "3000",
        defaultValue: "3000",
        validate: (val) =>
          !!val && (isNaN(Number(val)) || Number(val) <= 0)
            ? "Port must be a valid positive number"
            : undefined,
      });
      if (isCancel(portRes)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
      port = parseInt(portRes as string, 10);
    }

    let appDirName = options.appDir || "app";
    let componentsDirName = options.componentsDir || "components";
    let publicDirName = options.publicDir || "public";

    if (
      process.stdin.isTTY &&
      !options.appDir &&
      !options.componentsDir &&
      !options.publicDir
    ) {
      const customizeDirs = await confirm({
        message: "Do you want to customize directory names?",
        initialValue: false,
      });
      if (isCancel(customizeDirs)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      if (customizeDirs) {
        const appRes = await text({
          message: "Routes directory name:",
          placeholder: "app",
          defaultValue: "app",
        });
        if (isCancel(appRes)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }
        appDirName = appRes as string;

        const compRes = await text({
          message: "Components directory name:",
          placeholder: "components",
          defaultValue: "components",
        });
        if (isCancel(compRes)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }
        componentsDirName = compRes as string;

        const pubRes = await text({
          message: "Public directory name:",
          placeholder: "public",
          defaultValue: "public",
        });
        if (isCancel(pubRes)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }
        publicDirName = pubRes as string;
      }
    }

    let shouldInstall = !options.skipInstall;
    if (!options.skipInstall && process.stdin.isTTY) {
      const res = await confirm({
        message: "Install dependencies using pnpm?",
        initialValue: true,
      });
      if (isCancel(res)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
      shouldInstall = res as boolean;
    }
    const s = spinner();
    s.start("Scaffolding project...");

    fs.ensureDirSync(targetPath);

    // Create app structure with chosen directories
    const appDir = path.join(targetPath, appDirName);
    const componentsDir = path.join(targetPath, componentsDirName);
    const publicDir = path.join(targetPath, publicDirName);

    fs.ensureDirSync(appDir);
    fs.ensureDirSync(componentsDir);
    fs.ensureDirSync(publicDir);

    const ext = engine === "handlebars" ? "hbs" : engine;

    // Root layout
    const layoutContent =
      engine === "handlebars"
        ? `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <link rel="stylesheet" href="/app.css">
</head>
<body class="bg-slate-900 text-white min-h-screen">
  {{{body}}}
</body>
</html>`
        : engine === "ejs"
          ? `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <link rel="stylesheet" href="/app.css">
</head>
<body class="bg-slate-900 text-white min-h-screen">
  <%- body %>
</body>
</html>`
          : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nxpress App</title>
  <link rel="stylesheet" href="/app.css">
</head>
<body class="bg-slate-900 text-white min-h-screen">
  <!-- Content -->
</body>
</html>`;

    fs.writeFileSync(path.join(appDir, `layout.${ext}`), layoutContent);

    // Index page
    const indexPageContent =
      engine === "handlebars"
        ? `<div class="max-w-4xl mx-auto px-4 py-16 text-center">
  <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
    Welcome to {{title}}
  </h1>
  <p class="text-xl text-slate-400 mb-8">{{description}}</p>
  <div class="inline-block bg-slate-800 border border-slate-700 rounded-lg p-6 text-left">
    <p class="text-sm font-mono text-cyan-400">Edit <span class="text-amber-300">${appDirName}/index.${ext}</span> to get started.</p>
  </div>
</div>`
        : engine === "ejs"
          ? `<div class="max-w-4xl mx-auto px-4 py-16 text-center">
  <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
    Welcome to <%= title %>
  </h1>
  <p class="text-xl text-slate-400 mb-8"><%= description %></p>
  <div class="inline-block bg-slate-800 border border-slate-700 rounded-lg p-6 text-left">
    <p class="text-sm font-mono text-cyan-400">Edit <span class="text-amber-300">${appDirName}/index.${ext}</span> to get started.</p>
  </div>
</div>`
          : `<div class="max-w-4xl mx-auto px-4 py-16 text-center">
  <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
    Welcome to Nxpress
  </h1>
  <p class="text-xl text-slate-400 mb-8">Express.js with Next.js developer experience</p>
</div>`;

    fs.writeFileSync(path.join(appDir, `index.${ext}`), indexPageContent);

    // Data loader for index page
    const indexTsContent = `import type { Request, Response } from '@nxpress/core';

export async function props(req: Request, res: Response) {
  return {
    title: 'Nxpress App',
    description: 'Express.js with Next.js developer experience',
  };
}
`;
    fs.writeFileSync(path.join(appDir, "index.ts"), indexTsContent);

    // App CSS for Tailwind v4
    fs.writeFileSync(
      path.join(targetPath, "app.css"),
      `@import "tailwindcss";\n`,
    );

    // Server file
    const serverTsContent = `import { nxpress } from '@nxpress/core';

const app = nxpress({
  engine: '${engine === "handlebars" ? "hbs" : engine}',
});

const PORT = process.env.PORT || ${port};
app.listen(PORT, () => {
  console.log(\`Nxpress server running on http://localhost:\${PORT}\`);
});
`;
    fs.writeFileSync(path.join(targetPath, "server.ts"), serverTsContent);

    const pkgVersion = "1.0.4";

    // nxpress.config.json
    const nxConfig = {
      $schema: `https://unpkg.com/@nxpress/core@${pkgVersion}/schema.json`,
      port,
      engine: engine === "handlebars" ? "hbs" : engine,
      appDir: appDirName,
      componentsDir: componentsDirName,
      publicDir: publicDirName,
    };
    fs.writeFileSync(
      path.join(targetPath, "nxpress.config.json"),
      JSON.stringify(nxConfig, null, 2),
    );

    // package.json for target project
    const projectPkgJson = {
      name: path.basename(targetPath),
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "nxpress dev",
        build: "tsc",
        start: "nxpress start",
      },
      dependencies: {
        "@nxpress/core": `^${pkgVersion}`,
      },
      devDependencies: {
        typescript: "^5.3.3",
        "@types/node": "^20.11.24",
      },
    };

    fs.writeFileSync(
      path.join(targetPath, "package.json"),
      JSON.stringify(projectPkgJson, null, 2),
    );

    // tsconfig.json for target project
    const projectTsConfig = {
      compilerOptions: {
        target: "ES2022",
        module: "CommonJS",
        moduleResolution: "node",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
      },
      include: ["**/*"],
    };
    fs.writeFileSync(
      path.join(targetPath, "tsconfig.json"),
      JSON.stringify(projectTsConfig, null, 2),
    );

    // .gitignore
    const gitignoreContent = `node_modules
dist
.env
*.log
`;
    fs.writeFileSync(path.join(targetPath, ".gitignore"), gitignoreContent);

    s.stop("Project structure created successfully.");

    if (shouldInstall) {
      const instSpinner = spinner();
      instSpinner.start("Installing dependencies with pnpm...");
      try {
        execSync("pnpm install", { cwd: targetPath, stdio: "ignore" });
        instSpinner.stop("Dependencies installed successfully.");
      } catch (err) {
        instSpinner.stop("Failed to install dependencies automatically.");
      }
    }

    outro(
      `Project created in ${chalk.cyan(projectDir)}!\n\n` +
        `Next steps:\n` +
        `  ${chalk.cyan(`cd ${projectDir}`)}\n` +
        `  ${chalk.cyan("pnpm dev")}`,
    );
  });

program.parse(process.argv);
