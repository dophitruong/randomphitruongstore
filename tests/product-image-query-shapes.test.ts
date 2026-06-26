import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const primaryImageQuery = 'images: { orderBy: { sortOrder: "asc" }, take: 1 }';
const fullGalleryQuery = 'images: { orderBy: { sortOrder: "asc" } }';

async function readSource(path: string) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

describe("product image query shapes", () => {
  it("fetches only the ordered primary image for product listing contexts", async () => {
    const sources = await Promise.all([
      readSource("../src/app/(store)/shop/page.tsx"),
      readSource("../src/app/api/products/route.ts"),
      readSource("../src/app/(store)/checkout/page.tsx"),
      readSource("../src/app/(store)/shop/[slug]/page.tsx")
    ]);

    for (const source of sources) {
      assert.match(source, new RegExp(escapeRegExp(primaryImageQuery)));
    }
  });

  it("keeps the product detail gallery query as the complete ordered image list", async () => {
    const source = await readSource("../src/app/(store)/shop/[slug]/page.tsx");

    assert.match(source, new RegExp(escapeRegExp(fullGalleryQuery)));
    assert.match(source, /<ProductGallery/);
  });
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
