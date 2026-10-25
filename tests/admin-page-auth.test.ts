import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const panelUrl = new URL("../src/app/admin/(panel)/", import.meta.url);

describe("admin page authentication", () => {
  it("checks the admin session in every panel page, not only the shared layout", async () => {
    const pages = (await readdir(panelUrl, { recursive: true }))
      .map((entry) => entry.replaceAll("\\", "/"))
      .filter((entry) => entry === "page.tsx" || entry.endsWith("/page.tsx"));

    assert.ok(pages.length >= 6, `expected the admin panel pages, found ${pages.length}`);

    for (const page of pages) {
      const source = await readFile(new URL(page, panelUrl), "utf8");
      assert.match(
        source,
        /import \{ requireAdmin \} from "@\/lib\/admin-auth";/,
        `${page} must import requireAdmin`
      );
      assert.match(
        source,
        /export default async function[\s\S]*?\)\s*\{\s*await requireAdmin\(\);/,
        `${page} must call await requireAdmin() before loading data`
      );
    }
  });
});
