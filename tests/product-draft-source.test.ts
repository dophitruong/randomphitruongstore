import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

async function readSource(path: string) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

describe("product draft source integration", () => {
  it("excludes drafts from public catalog, public API, checkout page, and order lookup", async () => {
    const sources = await Promise.all([
      readSource("../src/lib/public-catalog.ts"),
      readSource("../src/app/api/products/route.ts"),
      readSource("../src/app/(store)/checkout/page.tsx"),
      readSource("../src/lib/checkout-order.ts")
    ]);

    for (const source of sources) {
      assert.match(source, /status:\s*"PUBLISHED"/);
    }
  });

  it("keeps draft persistence separate from strict publish endpoints", async () => {
    const [createDraftSource, updateDraftSource, productRouteSource] =
      await Promise.all([
        readSource("../src/app/api/products/drafts/route.ts"),
        readSource("../src/app/api/products/[id]/draft/route.ts"),
        readSource("../src/app/api/products/[id]/route.ts")
      ]);

    assert.match(createDraftSource, /productDraftInputSchema/);
    assert.match(createDraftSource, /hasMeaningfulProductDraftData/);
    assert.match(createDraftSource, /prisma\.product\.create/);
    assert.match(createDraftSource, /buildProductDraftWrite/);

    assert.match(updateDraftSource, /existingProduct\.status !== "DRAFT"/);
    assert.match(updateDraftSource, /productVariant\.deleteMany/);
    assert.match(updateDraftSource, /buildProductDraftWrite/);

    assert.match(productRouteSource, /productInputSchema/);
    assert.match(productRouteSource, /buildProductCatalogWrite/);
  });

  it("shows drafts in the admin products UI with tab, filter, badge, and resume action", async () => {
    const source = await readSource("../src/components/admin-product-manager.tsx");

    assert.match(source, /Drafts \(\{draftCount\}\)/);
    assert.match(source, /statusFilter/);
    assert.match(source, /<option value="DRAFT">Draft<\/option>/);
    assert.match(source, /ProductStatusBadge/);
    assert.match(source, /Resume draft/);
    assert.match(source, /\/api\/products\/\$\{draftId\}\/draft/);
    assert.match(source, /\/api\/products\/drafts/);
    assert.match(source, /window\.confirm\(\s*"Publish this product\?/);
    assert.match(source, /Delete draft/);
  });
});
