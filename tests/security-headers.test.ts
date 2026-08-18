import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const configUrl = new URL("../next.config.ts", import.meta.url);

describe("production security headers", () => {
  it("configures common browser security headers in Next.js", async () => {
    const config = await readFile(configUrl, "utf8");

    for (const header of [
      "Strict-Transport-Security",
      "Content-Security-Policy",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "X-Robots-Tag"
    ]) {
      assert.match(config, new RegExp(`key:\\s*["']${header}["']`));
    }

    assert.match(config, /frame-ancestors 'none'/);
    assert.match(config, /X-Content-Type-Options["'],\s*value:\s*["']nosniff/);
    assert.match(config, /source:\s*["']\/admin\/:path\*["']/);
    assert.match(config, /source:\s*["']\/api\/:path\*["']/);
  });

  it("ensures all sensitive and preference cookies enforce httpOnly", async () => {
    const files = [
      "src/lib/admin-auth.ts",
      "src/lib/guest-order-cookie.ts",
      "src/app/api/currency/route.ts",
      "src/app/api/locale/route.ts"
    ];

    for (const file of files) {
      const content = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
      assert.match(
        content,
        /httpOnly:\s*true/,
        `Expected ${file} to set httpOnly: true on cookies`
      );
    }
  });
});
