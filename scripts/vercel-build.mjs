#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const migrateStep = ["prisma", ["migrate", "deploy"]];

function main() {
  const plan = buildPlan(process.env);

  if (process.env.VERCEL_BUILD_DRY_RUN === "1") {
    console.log(JSON.stringify(plan.steps.map(formatStep)));
    return;
  }

  console.log(`[vercel-build] Starting build for: ${deploymentLabel(process.env)}`);

  run("prisma", ["generate"]);

  if (plan.runMigrations) {
    if (!process.env.DIRECT_URL) {
      console.warn(
        "[vercel-build] WARNING: DIRECT_URL is not set. " +
          "Skipping prisma migrate deploy to prevent build failure. " +
          "Add DIRECT_URL to Vercel environment variables and redeploy to apply pending migrations."
      );
    } else {
      console.log("[vercel-build] Running prisma migrate deploy...");
      run(...migrateStep);
      console.log("[vercel-build] Migrations applied successfully.");
    }
  } else {
    console.log(
      `[vercel-build] Skipping prisma migrate deploy for ${deploymentLabel(process.env)} build. ` +
        "Set VERCEL_RUN_MIGRATIONS=1 only when this deployment has a dedicated database."
    );
  }

  console.log("[vercel-build] Running next build...");
  run("next", ["build"]);
}

function buildPlan(env) {
  const runMigrations = shouldRunMigrations(env);
  return {
    runMigrations,
    steps: [
      ["prisma", ["generate"]],
      ...(runMigrations ? [migrateStep] : []),
      ["next", ["build"]]
    ]
  };
}

function shouldRunMigrations(env) {
  if (env.VERCEL_SKIP_MIGRATIONS === "1") return false;
  if (env.VERCEL_RUN_MIGRATIONS === "1") return true;
  return env.VERCEL_ENV === "production";
}

function deploymentLabel(env) {
  return env.VERCEL_ENV || "non-Vercel";
}

function run(command, args) {
  const executable = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, { stdio: "inherit" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function formatStep([command, args]) {
  return [command, ...args].join(" ");
}

main();
