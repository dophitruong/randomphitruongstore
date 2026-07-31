import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

describe("getOptimizedCloudinaryUrl", () => {
  test("returns original URL for non-cloudinary URLs", () => {
    assert.equal(
      getOptimizedCloudinaryUrl("/sukajan/SukajanHero-cropped.jpg", { width: 600 }),
      "/sukajan/SukajanHero-cropped.jpg"
    );
    assert.equal(
      getOptimizedCloudinaryUrl("https://example.com/image.jpg", { width: 600 }),
      "https://example.com/image.jpg"
    );
    assert.equal(getOptimizedCloudinaryUrl("", { width: 600 }), "");
    assert.equal(getOptimizedCloudinaryUrl(null, { width: 600 }), "");
  });

  test("adds default auto quality and format with width transformations to Cloudinary URLs", () => {
    const input = "https://res.cloudinary.com/demo/image/upload/v12345678/sample.jpg";
    const result = getOptimizedCloudinaryUrl(input, { width: 600 });
    assert.equal(
      result,
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_600/v12345678/sample.jpg"
    );
  });

  test("replaces existing transformation parameters cleanly", () => {
    const input = "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1000/v12345678/sample.jpg";
    const result = getOptimizedCloudinaryUrl(input, { width: 200 });
    assert.equal(
      result,
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_200/v12345678/sample.jpg"
    );
  });

  test("supports height and custom options", () => {
    const input = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    const result = getOptimizedCloudinaryUrl(input, { width: 1200, quality: 80 });
    assert.equal(
      result,
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_80,c_limit,w_1200/sample.jpg"
    );
  });
});
