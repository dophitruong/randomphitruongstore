import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterOrders,
  type AdminOrderRow
} from "../src/components/admin-orders-manager";
import {
  formatVietnamDate,
  formatVietnamDateTime,
  formatVietnamTime
} from "../src/lib/format";

const sampleOrders: AdminOrderRow[] = [
  {
    id: "ord-1",
    orderNumber: "ODR-20260819-A1B2C3",
    totalAmount: 1250000,
    paymentMethod: "ONLINE_100_SEPAY",
    status: "PAID_FULL",
    createdAt: new Date("2026-08-19T03:30:00.000Z"), // 10:30 UTC+7
    customer: {
      fullName: "Nguyễn Văn A",
      phone: "0901234567"
    },
    items: [
      { id: "item-1", productName: "Sukajan Phoenix Jacket Limited", quantity: 1 },
      { id: "item-2", productName: "Graphic T-Shirt Vintage", quantity: 2 }
    ],
    payments: [
      { id: "pay-1", paymentType: "FULL_PAYMENT", paymentStatus: "PAID" }
    ]
  },
  {
    id: "ord-2",
    orderNumber: "ODR-20260819-X9Y8Z7",
    totalAmount: 850000,
    paymentMethod: "DEPOSIT_50_BANK_ZALO",
    status: "PENDING_DEPOSIT",
    createdAt: new Date("2026-08-19T14:45:00.000Z"), // 21:45 UTC+7
    customer: {
      fullName: "Trần Thị B",
      phone: "0987654321"
    },
    items: [
      { id: "item-3", productName: "Cargo Pants Black Oversized", quantity: 1 }
    ],
    payments: [
      { id: "pay-2", paymentType: "DEPOSIT", paymentStatus: "PENDING" }
    ]
  },
  {
    id: "ord-3",
    orderNumber: "ODR-20260818-K4L5M6",
    totalAmount: 2100000,
    paymentMethod: "ONLINE_100_SEPAY",
    status: "SHIPPING",
    createdAt: new Date("2026-08-18T17:15:00.000Z"), // 00:15 on 2026-08-19 UTC+7
    customer: {
      fullName: "Lê Hoàng C",
      phone: "0911223344"
    },
    items: [
      { id: "item-4", productName: "Sukajan Dragon Embroidered Silk", quantity: 1 }
    ],
    payments: [
      { id: "pay-3", paymentType: "FULL_PAYMENT", paymentStatus: "PAID" }
    ]
  }
];

describe("Admin order search filtering", () => {
  it("returns all orders when query is empty or whitespace", () => {
    assert.equal(filterOrders(sampleOrders, "").length, 3);
    assert.equal(filterOrders(sampleOrders, "   ").length, 3);
  });

  it("filters orders by exact and partial orderNumber (case-insensitive)", () => {
    // Exact
    const exact = filterOrders(sampleOrders, "ODR-20260819-A1B2C3");
    assert.equal(exact.length, 1);
    assert.equal(exact[0].id, "ord-1");

    // Partial lowercase
    const partialLower = filterOrders(sampleOrders, "a1b2c3");
    assert.equal(partialLower.length, 1);
    assert.equal(partialLower[0].id, "ord-1");

    // Partial uppercase prefix
    const dateQuery = filterOrders(sampleOrders, "20260819");
    assert.equal(dateQuery.length, 2);
  });

  it("filters orders by partial product name (case-insensitive)", () => {
    // Matches Sukajan across two orders
    const sukajan = filterOrders(sampleOrders, "sukajan");
    assert.equal(sukajan.length, 2);
    assert.deepEqual(
      sukajan.map((o) => o.id),
      ["ord-1", "ord-3"]
    );

    // Partial specific word "phoenix"
    const phoenix = filterOrders(sampleOrders, "PHOENIX");
    assert.equal(phoenix.length, 1);
    assert.equal(phoenix[0].id, "ord-1");

    // Matches Cargo Pants
    const cargo = filterOrders(sampleOrders, "cargo pants");
    assert.equal(cargo.length, 1);
    assert.equal(cargo[0].id, "ord-2");

    // Matches secondary item in order
    const tshirt = filterOrders(sampleOrders, "t-shirt");
    assert.equal(tshirt.length, 1);
    assert.equal(tshirt[0].id, "ord-1");
  });

  it("returns empty array when no orders match", () => {
    const noMatch = filterOrders(sampleOrders, "NonexistentItem12345");
    assert.equal(noMatch.length, 0);
  });
});

describe("Vietnam timezone (Asia/Ho_Chi_Minh) datetime formatting", () => {
  it("formats date and time accurately in UTC+7", () => {
    // 2026-08-19T03:30:00Z -> 10:30:00 19/08/2026 in Asia/Ho_Chi_Minh
    const date1 = new Date("2026-08-19T03:30:00.000Z");
    const formatted = formatVietnamDateTime(date1);
    assert.match(formatted, /10:30/);
    assert.match(formatted, /19\/08\/2026/);

    // 2026-08-18T17:15:00Z -> 00:15:00 19/08/2026 in Asia/Ho_Chi_Minh (day rolls over)
    const date2 = new Date("2026-08-18T17:15:00.000Z");
    const formattedRoll = formatVietnamDateTime(date2);
    assert.match(formattedRoll, /00:15/);
    assert.match(formattedRoll, /19\/08\/2026/);
  });

  it("formats date-only and time-only in UTC+7", () => {
    const date = new Date("2026-08-19T07:05:00.000Z"); // 14:05 in VN
    assert.equal(formatVietnamDate(date), "19/08/2026");
    assert.equal(formatVietnamTime(date), "14:05");
  });

  it("handles null, undefined, or invalid date values gracefully", () => {
    assert.equal(formatVietnamDateTime(null), "-");
    assert.equal(formatVietnamDateTime(undefined), "-");
    assert.equal(formatVietnamDateTime("invalid-date-string"), "-");
    assert.equal(formatVietnamDate(null), "-");
    assert.equal(formatVietnamTime(null), "-");
  });
});
