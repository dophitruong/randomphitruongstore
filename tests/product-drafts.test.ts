import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Prisma } from "@prisma/client";
import {
  buildProductCatalogWrite,
  buildProductDraftWrite
} from "../src/lib/product-catalog";
import {
  draftSlugForProductId,
  hasMeaningfulProductDraftData,
  isDraftPlaceholderSlug
} from "../src/lib/product-drafts";
import {
  productDraftInputSchema,
  productInputSchema
} from "../src/lib/validations";

const productId = "00000000-0000-4000-8000-000000000301";
const categoryId = "00000000-0000-4000-8000-000000000201";

describe("product draft management helpers", () => {
  it("keeps published product validation strict while draft validation allows partial data", () => {
    const partial = {
      nameEn: "Crane jacket"
    };

    assert.equal(productInputSchema.safeParse(partial).success, false);
    assert.equal(productDraftInputSchema.safeParse(partial).success, true);
  });

  it("ignores default-only autosave state and accepts meaningful user-entered draft data", () => {
    assert.equal(
      hasMeaningfulProductDraftData({
        categoryId,
        basePrice: 1500000,
        stockStatus: "IN_STOCK",
        images: [],
        sizeCharts: []
      }),
      false
    );
    assert.equal(hasMeaningfulProductDraftData({ nameVi: "Ao dang nhap" }), true);
    assert.equal(
      hasMeaningfulProductDraftData({ images: ["/uploads/draft-front.webp"] }),
      true
    );
  });

  it("builds a database-safe draft write with draft status and stable draft slug", () => {
    const draft = productDraftInputSchema.parse({
      nameEn: "Crane draft",
      images: ["/uploads/crane-draft.webp"],
      variants: [
        {
          size: "M",
          colorVi: "Den",
          colorEn: "",
          priceAdjustment: 0,
          isAvailable: true
        },
        {
          size: "",
          colorVi: "",
          priceAdjustment: 0,
          isAvailable: true
        }
      ],
      sizeCharts: [
        {
          size: "M",
          chest: 54,
          unit: "cm"
        }
      ]
    });

    const write = buildProductDraftWrite(draft, { productId, categoryId });

    assert.equal(write.productData.status, "DRAFT");
    assert.equal(write.productData.slug, draftSlugForProductId(productId));
    assert.equal(isDraftPlaceholderSlug(write.productData.slug, productId), true);
    assert.equal(write.productData.nameVi, "Draft product");
    assert.equal(write.productData.nameEn, "Crane draft");
    assert.equal(write.productData.categoryId, categoryId);
    assert.deepEqual(write.images, [
      {
        url: "/uploads/crane-draft.webp",
        altVi: "Draft product",
        altEn: "Crane draft",
        sortOrder: 0
      }
    ]);
    assert.deepEqual(write.variants, [
      {
        size: "M",
        colorVi: "Den",
        colorEn: "Den",
        priceAdjustment: 0,
        isAvailable: true
      }
    ]);
    assert.deepEqual(write.sizeCharts, [
      {
        size: "M",
        shoulder: undefined,
        chest: 54,
        length: undefined,
        sleeve: undefined,
        measurements: Prisma.DbNull,
        unit: "cm"
      }
    ]);
  });

  it("uses strict published writes to publish products", () => {
    const product = productInputSchema.parse({
      nameVi: "Sukajan Hac Song",
      nameEn: "Crane Sukajan",
      slug: "crane-sukajan-draft-test",
      descriptionVi: "Ao sukajan theu hac song form rong.",
      descriptionEn: "Crane embroidered sukajan with relaxed fit.",
      categoryId,
      basePrice: 2400000,
      images: ["/uploads/crane-front.webp"],
      variants: [
        {
          size: "M",
          colorVi: "Den",
          colorEn: "Black",
          priceAdjustment: 0,
          isAvailable: true
        }
      ],
      materialVi: "Satin cao cap",
      materialEn: "Premium satin",
      stockStatus: "IN_STOCK",
      isFeatured: false,
      isActive: true
    });

    const write = buildProductCatalogWrite(product);

    assert.equal(write.productData.status, "PUBLISHED");
  });
});
