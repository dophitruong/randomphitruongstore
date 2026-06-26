import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  duplicateProductImageUrlIndex,
  moveProductImageUrl,
  removeProductImageUrl,
  setPrimaryProductImageUrl,
  splitProductImageUrls
} from "../src/lib/product-images";

describe("product image ordering helpers", () => {
  it("parses newline image URL text without keeping blank rows", () => {
    assert.deepEqual(
      splitProductImageUrls(" /uploads/front.webp \n\n/uploads/back.webp\r\n "),
      ["/uploads/front.webp", "/uploads/back.webp"]
    );
  });

  it("finds exact duplicate image URLs", () => {
    assert.equal(
      duplicateProductImageUrlIndex([
        "/uploads/front.webp",
        "/uploads/back.webp",
        "/uploads/front.webp"
      ]),
      2
    );
  });

  it("moves images earlier and later without changing the rest of the order", () => {
    const images = [
      "/uploads/front.webp",
      "/uploads/back.webp",
      "/uploads/detail.webp"
    ];

    assert.deepEqual(moveProductImageUrl(images, 2, "earlier"), [
      "/uploads/front.webp",
      "/uploads/detail.webp",
      "/uploads/back.webp"
    ]);
    assert.deepEqual(moveProductImageUrl(images, 0, "later"), [
      "/uploads/back.webp",
      "/uploads/front.webp",
      "/uploads/detail.webp"
    ]);
  });

  it("sets a selected image as primary by moving it to index zero", () => {
    assert.deepEqual(
      setPrimaryProductImageUrl(
        ["/uploads/front.webp", "/uploads/back.webp", "/uploads/detail.webp"],
        2
      ),
      ["/uploads/detail.webp", "/uploads/front.webp", "/uploads/back.webp"]
    );
  });

  it("removes non-primary and primary images while preserving remaining order", () => {
    const images = [
      "/uploads/front.webp",
      "/uploads/back.webp",
      "/uploads/detail.webp"
    ];

    assert.deepEqual(removeProductImageUrl(images, 1), [
      "/uploads/front.webp",
      "/uploads/detail.webp"
    ]);
    assert.deepEqual(removeProductImageUrl(images, 0), [
      "/uploads/back.webp",
      "/uploads/detail.webp"
    ]);
  });
});
