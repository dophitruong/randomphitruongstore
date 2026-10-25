import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

// First versions that fix the advisories flagged by `npm audit` (critical Next.js RCE, zod memory DoS, sharp, axios).
const minimumVersions: Record<string, string> = {
  next: "16.4.1",
  zod: "4.6.6",
  sharp: "0.35.5",
  axios: "1.20.0"
};

function compareVersions(a: string, b: string) {
  const left = a.split("-")[0].split(".").map(Number);
  const right = b.split("-")[0].split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

describe("dependency security floor", () => {
  it("locks every copy of patched packages at or above the fixed version", async () => {
    const lock = JSON.parse(
      await readFile(new URL("../package-lock.json", import.meta.url), "utf8")
    ) as { packages: Record<string, { version?: string }> };

    for (const [name, minimum] of Object.entries(minimumVersions)) {
      const entries = Object.entries(lock.packages).filter(([path]) =>
        path === `node_modules/${name}` || path.endsWith(`/node_modules/${name}`)
      );
      assert.ok(entries.length > 0, `${name} is missing from package-lock.json`);

      for (const [path, entry] of entries) {
        assert.ok(
          entry.version && compareVersions(entry.version, minimum) >= 0,
          `${path}@${entry.version} is below the patched version ${minimum}`
        );
      }
    }
  });
});
