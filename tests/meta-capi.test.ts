import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeMetaPhone } from "../src/lib/meta-capi";

describe("Meta CAPI phone matching", () => {
  it("converts Vietnamese local numbers to country-code digits", () => {
    assert.equal(normalizeMetaPhone("0388 390 482"), "84388390482");
    assert.equal(normalizeMetaPhone("+84 388-390-482"), "84388390482");
    assert.equal(normalizeMetaPhone("84388390482"), "84388390482");
    assert.equal(normalizeMetaPhone(""), null);
    assert.equal(normalizeMetaPhone(null), null);
  });
});
