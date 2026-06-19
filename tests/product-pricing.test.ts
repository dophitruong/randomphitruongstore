import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { productBasePrice, productVariantPrice } from "../src/lib/product-pricing";

describe("product pricing helpers", () => {
  it("uses required basePrice for storefront display and filters", () => {
    assert.equal(
      productBasePrice({
        basePrice: 2400000
      }),
      2400000
    );
  });

  it("rejects products that still rely on the removed legacy price fallback", () => {
    assert.throws(
      () =>
        productBasePrice({
          basePrice: null
        } as never),
      /basePrice/
    );
  });

  it("adds variant price adjustments on top of the chosen product base price", () => {
    assert.equal(
      productVariantPrice(
        {
          basePrice: 2400000
        },
        {
          priceAdjustment: 90000
        }
      ),
      2490000
    );
  });
});
