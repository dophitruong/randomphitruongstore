import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { maxOrderLineItems, orderInputSchema } from "../src/lib/validations";

const checkoutInput = {
  fullName: "Nguyen Van A",
  phone: "0901234567",
  email: "guest@example.com",
  address: "123 Nguyen Trai",
  province: "Ho Chi Minh",
  district: "District 1",
  ward: "Ben Nghe",
  shippingRegion: "VIETNAM",
  paymentMethod: "ONLINE_100_SEPAY",
  noChangePolicyAck: true
};

function lineItems(count: number) {
  return Array.from({ length: count }, () => ({
    productId: "00000000-0000-4000-8000-000000000001",
    productVariantId: "00000000-0000-4000-8000-000000000101",
    quantity: 1,
    size: "M",
    color: "Black"
  }));
}

describe("order input limits", () => {
  it("accepts an order at the line item cap", () => {
    const parsed = orderInputSchema.safeParse({
      ...checkoutInput,
      items: lineItems(maxOrderLineItems)
    });
    assert.equal(parsed.success, true);
  });

  it("rejects an order with more line items than the cap", () => {
    const parsed = orderInputSchema.safeParse({
      ...checkoutInput,
      items: lineItems(maxOrderLineItems + 1)
    });
    assert.equal(parsed.success, false);
  });

  it("rejects an oversized payload instead of validating thousands of lines", () => {
    const parsed = orderInputSchema.safeParse({
      ...checkoutInput,
      items: lineItems(10_000)
    });
    assert.equal(parsed.success, false);
  });
});
