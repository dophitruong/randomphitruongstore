import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findAvailableProductVariant,
  productVariantMatchesSelection
} from "../src/lib/product-catalog";

describe("product variant color selection", () => {
  const oneColorVariants = [
    {
      id: "variant-black",
      size: "M",
      colorVi: "Black",
      colorEn: "Black",
      priceAdjustment: 0,
      isAvailable: true
    }
  ];

  const multiColorVariants = [
    {
      id: "variant-combined",
      size: "M",
      colorVi: "Black, White",
      colorEn: "Black, White",
      priceAdjustment: 0,
      isAvailable: true
    }
  ];
  const matrixColorVariants = [
    {
      id: "variant-black",
      size: "M",
      colorVi: "Black",
      colorEn: "Black",
      priceAdjustment: 0,
      isAvailable: true
    },
    {
      id: "variant-white",
      size: "M",
      colorVi: "White",
      colorEn: "White",
      priceAdjustment: 10000,
      isAvailable: true
    }
  ];

  it("keeps the one-color checkout selection valid", () => {
    assert.equal(
      productVariantMatchesSelection(oneColorVariants[0], {
        variantId: "variant-black",
        size: "M",
        color: "Black"
      }),
      true
    );
  });

  it("resolves the selected color token for a multi-color product variant", () => {
    assert.equal(
      findAvailableProductVariant(multiColorVariants, "M", "White")?.id,
      "variant-combined"
    );
  });

  it("keeps the selected multi-color token valid at checkout", () => {
    assert.equal(
      productVariantMatchesSelection(multiColorVariants[0], {
        variantId: "variant-combined",
        size: "M",
        color: "White"
      }),
      true
    );
  });

  it("resolves the selected color to the exact variant row", () => {
    assert.equal(
      findAvailableProductVariant(matrixColorVariants, "M", "White")?.id,
      "variant-white"
    );
    assert.equal(
      productVariantMatchesSelection(matrixColorVariants[0], {
        variantId: "variant-black",
        size: "M",
        color: "White"
      }),
      false
    );
  });

  it("does not match unavailable variants", () => {
    assert.equal(
      productVariantMatchesSelection(
        { ...matrixColorVariants[1], isAvailable: false },
        {
          variantId: "variant-white",
          size: "M",
          color: "White"
        }
      ),
      false
    );
  });
});
