#!/usr/bin/env node

import {
  cancel,
  confirm,
  intro,
  isCancel,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts";
import chalk from "chalk";
import { exec } from "child_process";
import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

const deps = ["@nxpress/core"];
const devDeps = ["@types/express", "@types/node", "typescript", "tsx"];

function getInstallCommands(
  pm: string,
  depsList: string[],
  devDepsList: string[],
) {
  const depsStr = depsList.join(" ");
  const devDepsStr = devDepsList.join(" ");
  switch (pm) {
    case "npm":
      return {
        depsCmd: `npm install ${depsStr}`,
        devDepsCmd: `npm install -D ${devDepsStr}`,
      };
    case "yarn":
      return {
        depsCmd: `yarn add ${depsStr}`,
        devDepsCmd: `yarn add -D ${devDepsStr}`,
      };
    case "bun":
      return {
        depsCmd: `bun add ${depsStr}`,
        devDepsCmd: `bun add -d ${devDepsStr}`,
      };
    case "deno":
      return {
        depsCmd: `deno add ${depsStr}`,
        devDepsCmd: `deno add -D ${devDepsStr}`,
      };
    case "pnpm":
    default:
      return {
        depsCmd: `pnpm add ${depsStr}`,
        devDepsCmd: `pnpm add -D ${devDepsStr}`,
      };
  }
}

const program = new Command();

program
  .name("create-nxpress-app")
  .description("Scaffold a new Nxpress project")
  .argument("[project-directory]", "Directory for the project")
  .option("-y, --yes", "Skip prompts and use default configuration")
  .option("--api", "Create an API-only project without views or components")
  .option("-e, --engine <engine>", "Template engine (handlebars, ejs, html, nunjucks, liquid)")
  .option("-p, --port <number>", "Port number")
  .option("--tailwind", "Include Tailwind CSS support", true)
  .option("-m, --minimal", "Create a minimal project without views or components")
  .option("--app-dir <dir>", "Directory for application routes")
  .option("--components-dir <dir>", "Directory for components")
  .option("--public-dir <dir>", "Directory for static assets")
  .option("--pkg-manager <pm>", "Package manager (pnpm, npm, yarn, bun, deno)")
  .action(async (projectDirArg, options) => {
    console.log();
    intro(chalk.bgCyan.black(" Create Nxpress App "));

    const isYes = Boolean(options.yes);
    const isApi = Boolean(options.api);
    const isMinimal = Boolean(options.minimal) || isApi;

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

    if (fs.existsSync(targetPath) && fs.readdirSync(targetPath).length > 0 && !isYes) {
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
    if (!isApi) {
      if (isYes && !engine) {
        engine = "ejs";
      } else if (
        !engine ||
        !["ejs", "handlebars", "nunjucks", "liquid", "html"].includes(engine)
      ) {
        const selectedEngine = await select({
          message: "Which template engine do you want to use?",
          options: [
            {
              value: "ejs",
              label: "EJS (Eta) (Default)",
              hint: "Fast EJS syntax powered by Eta engine",
            },
            {
              value: "handlebars",
              label: "Handlebars",
              hint: "Clean syntax & partials",
            },
            {
              value: "nunjucks",
              label: "Nunjucks",
              hint: "Jinja2-inspired template engine",
            },
            {
              value: "liquid",
              label: "LiquidJS",
              hint: "Secure Shopify-style templates",
            },
            { value: "html", label: "HTML", hint: "Plain HTML templates" },
          ],
        });
        if (isCancel(selectedEngine)) {
          cancel("Operation cancelled.");
          process.exit(0);
        }
        engine = selectedEngine as string;
      }
    }

    let port = options.port ? parseInt(options.port, 10) : 3000;
    if (process.stdin.isTTY && !options.port && !isYes) {
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
      !isApi &&
      !isYes &&
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

    let pkgManager = options.pkgManager;
    if (process.stdin.isTTY && !options.pkgManager && !isYes) {
      const selectedPm = await select({
        message: "Which package manager do you want to use?",
        options: [
          {
            value: "pnpm",
            label: "pnpm (Default)",
            hint: "Fast & disk space efficient",
          },
          {
            value: "npm",
            label: "npm",
            hint: "Default Node.js package manager",
          },
          {
            value: "yarn",
            label: "yarn",
            hint: "Classic/Berry package manager",
          },
          {
            value: "bun",
            label: "bun",
            hint: "Ultra-fast runtime & package manager",
          },
          {
            value: "deno",
            label: "deno",
            hint: "Modern JavaScript/TypeScript runtime",
          },
        ],
        initialValue: "pnpm",
      });
      if (isCancel(selectedPm)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
      pkgManager = selectedPm as string;
    }
    if (!pkgManager) {
      pkgManager = "pnpm";
    }

    const s = spinner();
    s.start("Scaffolding project...");

    fs.ensureDirSync(targetPath);

    // Create app structure with chosen directories
    const appDir = path.join(targetPath, appDirName);
    fs.ensureDirSync(appDir);

    const templatesDir = path.resolve(__dirname, "..", "templates");

    if (isApi) {
      // Scaffolding API-only project
      const apiDir = path.join(appDir, "api");
      const apiUsersDir = path.join(apiDir, "users");
      fs.ensureDirSync(apiUsersDir);

      const templateApiDir = path.join(templatesDir, "app", "api");
      if (fs.existsSync(templateApiDir)) {
        fs.copySync(templateApiDir, apiDir);
      }
    } else {
      const componentsDir = path.join(targetPath, componentsDirName);
      const publicDir = path.join(targetPath, publicDirName);
      fs.ensureDirSync(componentsDir);
      fs.ensureDirSync(publicDir);

      const ext =
        engine === "handlebars" ? "hbs" : engine === "nunjucks" ? "njk" : engine;

      if (!isMinimal) {
        // Copy public assets (e.g., logo.png)
        const templatePublicDir = path.join(templatesDir, "public");
        if (fs.existsSync(templatePublicDir)) {
          fs.copySync(templatePublicDir, publicDir);
        }

        // Root layout from template
        const layoutTemplatePath = path.join(templatesDir, "app", `layout.${ext}`);
        if (fs.existsSync(layoutTemplatePath)) {
          fs.copySync(layoutTemplatePath, path.join(appDir, `layout.${ext}`));
        }

        // FeatureCard component from template
        const componentTemplatePath = path.join(
          templatesDir,
          "components",
          `FeatureCard.${ext}`,
        );
        if (fs.existsSync(componentTemplatePath)) {
          fs.copySync(
            componentTemplatePath,
            path.join(componentsDir, `FeatureCard.${ext}`),
          );
        }

        // Index page from template
        const indexTemplatePath = path.join(templatesDir, "app", `index.${ext}`);
        if (fs.existsSync(indexTemplatePath)) {
          let content = fs.readFileSync(indexTemplatePath, "utf8");
          content = content.replace(
            /app\/index\.(hbs|ejs|html|njk|liquid)/g,
            `${appDirName}/index.${ext}`,
          );
          fs.writeFileSync(path.join(appDir, `index.${ext}`), content);
        }

        // Data loader for index page
        const indexTsTemplatePath = path.join(templatesDir, "app", "index.ts");
        if (fs.existsSync(indexTsTemplatePath)) {
          fs.copySync(indexTsTemplatePath, path.join(appDir, "index.ts"));
        }

        // App middleware template
        const middlewareTsTemplatePath = path.join(
          templatesDir,
          "app",
          "middleware.ts",
        );
        if (fs.existsSync(middlewareTsTemplatePath)) {
          fs.copySync(middlewareTsTemplatePath, path.join(appDir, "middleware.ts"));
        }

        // Locales for i18n
        const templateLocalesDir = path.join(templatesDir, "locales");
        if (fs.existsSync(templateLocalesDir)) {
          const targetLocalesDir = path.join(targetPath, "locales");
          fs.ensureDirSync(targetLocalesDir);
          fs.copySync(templateLocalesDir, targetLocalesDir);
        }

        // App CSS for Tailwind v4
        const appCssTemplatePath = path.join(templatesDir, "app.css");
        if (fs.existsSync(appCssTemplatePath)) {
          fs.copySync(appCssTemplatePath, path.join(targetPath, "app.css"));
        }
      }

      // API route health template
      const apiHealthTemplatePath = path.join(
        templatesDir,
        "app",
        "api",
        "health.ts",
      );
      if (fs.existsSync(apiHealthTemplatePath)) {
        const apiDir = path.join(appDir, "api");
        fs.ensureDirSync(apiDir);
        fs.copySync(apiHealthTemplatePath, path.join(apiDir, "health.ts"));
      }
    }

    const appName = path
      .basename(targetPath)
      .replace(/[^A-Za-z0-9]/gi, " ")
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Server file
    const serverTsTemplatePath = path.join(templatesDir, "server.ts");
    if (fs.existsSync(serverTsTemplatePath)) {
      fs.copySync(serverTsTemplatePath, path.join(targetPath, "server.ts"));
    }

    // nxpress.config.json
    const nxConfig: Record<string, any> = {
      $schema: `https://unpkg.com/@nxpress/core@latest/schema.json`,
      port,
      appDir: appDirName,
    };

    if (!isApi) {
      nxConfig.engine = engine === "handlebars" ? "hbs" : engine;
      nxConfig.componentsDir = componentsDirName;
      nxConfig.publicDir = publicDirName;
      nxConfig.localesDir = "locales";
      nxConfig.i18n = {
        locales: ["en", "fr"],
        defaultLocale: "en",
        prefixDefault: false,
      };
      nxConfig.globals = {
        title: appName,
      };
    }

    fs.writeFileSync(
      path.join(targetPath, "nxpress.config.json"),
      JSON.stringify(nxConfig, null, 2),
    );

    // package.json for target project
    const projectPkgJson: Record<string, any> = {
      name: path.basename(targetPath),
      version: "0.0.1",
      private: true,
      scripts: {
        dev: "nxpress dev",
        build: "tsc",
        start: "nxpress start",
        serve: "tsx --watch server",
      },
    };

    if (!isApi) {
      projectPkgJson.scripts.export = "nxpress export";
    }

    fs.writeFileSync(
      path.join(targetPath, "package.json"),
      JSON.stringify(projectPkgJson, null, 2),
    );

    // tsconfig.json for target project
    const projectTsConfig = {
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        noEmit: true,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        types: ["node", "express"],
        resolveJsonModule: true,
        paths: {
          "@/*": ["./*"],
        },
      },
      include: ["**/*.ts"],
      exclude: ["node_modules", "dist"],
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

    const instSpinner = spinner();
    instSpinner.start(`Installing dependencies with ${pkgManager}...`);
    try {
      const { depsCmd, devDepsCmd } = getInstallCommands(
        pkgManager,
        deps,
        devDeps,
      );
      await execAsync(depsCmd, { cwd: targetPath });
      await execAsync(devDepsCmd, { cwd: targetPath });
      instSpinner.stop("Dependencies installed successfully.");
    } catch (err) {
      instSpinner.stop("Failed to install dependencies automatically.");
    }

    const devCmd = pkgManager === "npm" ? "npm run dev" : `${pkgManager} dev`;
    const serveCmd =
      pkgManager === "npm" ? "npm run serve" : `${pkgManager} serve`;

    const cdStep =
      projectDir === "." || projectDir === "./"
        ? ""
        : `Next steps:\n  ${chalk.cyan(`cd ${projectDir}`)}\n\n`;

    const extraSteps = isApi
      ? `API Routes:\n  ${chalk.cyan(`http://localhost:${port}/api/health`)}\n  ${chalk.cyan(`http://localhost:${port}/api/users`)}`
      : `Static export (SSG):\n  ${chalk.cyan(pkgManager === "npm" ? "npm run export" : `${pkgManager} export`)}`;

    outro(
      `Project created in ${chalk.cyan(projectDir)}!\n\n` +
        cdStep +
        `Start development:\n` +
        `  ${chalk.cyan(devCmd)} (via Nxpress CLI)\n` +
        `  ${chalk.cyan(serveCmd)} (via server.ts)\n\n` +
        extraSteps,
    );
  });

program.parse(process.argv);
