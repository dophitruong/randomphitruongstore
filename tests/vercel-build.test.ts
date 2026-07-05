import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

describe("Vercel build script", () => {
  it("skips database migrations for preview deployments", () => {
    assert.deepEqual(dryRun({ VERCEL_ENV: "preview" }), [
      "prisma generate",
      "next build"
    ]);
  });

  it("runs database migrations for production deployments", () => {
    assert.deepEqual(dryRun({ VERCEL_ENV: "production" }), [
      "prisma generate",
      "prisma migrate deploy",
      "next build"
    ]);
  });

  it("can force migrations for a preview deployment with a dedicated database", () => {
    assert.deepEqual(
      dryRun({
        VERCEL_ENV: "preview",
        VERCEL_RUN_MIGRATIONS: "1"
      }),
      [
        "prisma generate",
        "prisma migrate deploy",
        "next build"
      ]
    );
  });

  it("can skip migrations explicitly even in production", () => {
    assert.deepEqual(
      dryRun({
        VERCEL_ENV: "production",
        VERCEL_SKIP_MIGRATIONS: "1"
      }),
      [
        "prisma generate",
        "next build"
      ]
    );
  });
});

function dryRun(env: Record<string, string>) {
  const output = execFileSync(
    process.execPath,
    ["scripts/vercel-build.mjs"],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        ...env,
        VERCEL_BUILD_DRY_RUN: "1"
      }
    }
  );

  return JSON.parse(output) as string[];
}
