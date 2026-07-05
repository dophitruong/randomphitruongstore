#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const migrateStep = ["prisma", ["migrate", "deploy"]];

function main() {
  const plan = buildPlan(process.env);

  if (process.env.VERCEL_BUILD_DRY_RUN === "1") {
    console.log(JSON.stringify(plan.steps.map(formatStep)));
    return;
  }

  run("prisma", ["generate"]);

  if (plan.runMigrations) {
    run(...migrateStep);
  } else {
    console.log(
      `Skipping prisma migrate deploy for ${deploymentLabel(process.env)} build. ` +
        "Set VERCEL_RUN_MIGRATIONS=1 only when this deployment has a dedicated database."
    );
  }

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
