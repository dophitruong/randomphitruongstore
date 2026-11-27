import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bankTransferQrUrl } from "../src/lib/constants";

describe("bank transfer QR", () => {
  it("fills the amount and order code so customers do not type them by hand", () => {
    const url = new URL(bankTransferQrUrl(750000, "ODR-20261127-ABC123"));
    assert.equal(url.host, "qr.sepay.vn");
    assert.equal(url.searchParams.get("amount"), "750000");
    assert.equal(url.searchParams.get("des"), "ODR-20261127-ABC123");
    assert.equal(url.searchParams.get("holder"), "DO PHI TRUONG");
  });

  it("leaves amount and order code out when they are unknown", () => {
    const url = new URL(bankTransferQrUrl());
    assert.equal(url.searchParams.has("amount"), false);
    assert.equal(url.searchParams.has("des"), false);
  });
});
