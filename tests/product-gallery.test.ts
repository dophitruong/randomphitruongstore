import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductGallery } from "../src/components/product-gallery";

describe("ProductGallery", () => {
  it("renders the primary image and thumbnail controls for multiple images", () => {
    const html = renderToStaticMarkup(
      createElement(ProductGallery, {
        images: [
          { url: "/uploads/front.webp", alt: "Front view" },
          { url: "/uploads/back.webp", alt: "Back view" }
        ]
      })
    );

    assert.match(html, /alt="Front view"/);
    assert.match(html, /aria-label="View image 1"/);
    assert.match(html, /aria-label="View image 2"/);
    assert.ok(html.indexOf("Front view") < html.indexOf("Back view"));
  });

  it("does not render unnecessary thumbnail controls for one image", () => {
    const html = renderToStaticMarkup(
      createElement(ProductGallery, {
        images: [{ url: "/uploads/front.webp", alt: "Front view" }]
      })
    );

    assert.match(html, /alt="Front view"/);
    assert.doesNotMatch(html, /aria-label="View image/);
  });

  it("switches gallery images through local state without navigation", async () => {
    const source = await readFile(
      new URL("../src/components/product-gallery.tsx", import.meta.url),
      "utf8"
    );

    assert.match(source, /useState\(0\)/);
    assert.match(source, /onClick=\{\(\) => setActive\(index\)\}/);
    assert.doesNotMatch(source, /href=|router\./);
  });
});
