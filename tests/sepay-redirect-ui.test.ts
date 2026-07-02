import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import {
  hasPaymentDestination,
  type PaymentCheckoutData
} from "../src/lib/payment-navigation";

describe("SePay redirect confirmation UI", () => {
  it("recognizes reusable SePay payment payloads", () => {
    assert.equal(
      hasPaymentDestination({
        paymentUrl: "https://pay.sepay.vn/session/abc"
      }),
      true
    );

    assert.equal(
      hasPaymentDestination({
        checkout: {
          action: "https://pay.sepay.vn/v1/checkout/init",
          method: "POST",
          fields: { amount: 100000, order_id: "RPT-0001" }
        }
      }),
      true
    );

    assert.equal(hasPaymentDestination(null), false);
    assert.equal(hasPaymentDestination({} as PaymentCheckoutData), false);
    assert.equal(
      hasPaymentDestination({
        checkout: {
          action: "",
          method: "POST",
          fields: {}
        }
      }),
      false
    );
    assert.equal(
      hasPaymentDestination({
        checkout: {
          action: 42,
          method: "POST",
          fields: {}
        }
      } as unknown as PaymentCheckoutData),
      false
    );
  });

  it("uses a five-second redirect notice with cleanup and one-shot navigation", async () => {
    const source = await readFile(
      "src/components/sepay-redirect-notice.tsx",
      "utf8"
    );

    assert.match(source, /SEPAY_REDIRECT_DELAY_SECONDS = 5/);
    assert.match(source, /window\.setInterval/);
    assert.match(source, /window\.clearInterval/);
    assert.match(source, /hasNavigatedRef/);
    assert.match(source, /role="status"/);
    assert.match(source, /aria-live="polite"/);
    assert.match(source, /type="button"/);
    assert.match(source, /labels\.countdown\.replace\("\{seconds\}"/);
  });

  it("checkout stores the backend payment payload instead of navigating immediately", async () => {
    const source = await readFile("src/components/checkout-form.tsx", "utf8");

    assert.match(source, /setSePayPaymentData\(paymentResult\.data\)/);
    assert.match(source, /hasPaymentDestination\(paymentResult\.data\)/);
    assert.match(source, /<SePayRedirectNotice/);
    assert.doesNotMatch(source, /navigateToPayment\(paymentResult\.data\)/);
  });

  it("manual payment initiation reuses one payload for automatic and fallback redirect", async () => {
    const source = await readFile("src/components/payment-buttons.tsx", "utf8");

    assert.match(source, /setPaymentData\(result\.data\)/);
    assert.match(source, /hasPaymentDestination\(result\.data\)/);
    assert.match(source, /<SePayRedirectNotice/);
    assert.doesNotMatch(source, /navigateToPayment\(result\.data\)/);
  });

  it("order details only offers SePay redirect for pending SePay orders", async () => {
    const source = await readFile("src/app/(store)/order/[id]/page.tsx", "utf8");

    assert.match(source, /order\.paymentMethod === "ONLINE_100_SEPAY"/);
    assert.match(source, /order\.status === "PENDING_ONLINE_PAYMENT"/);
    assert.match(source, /requiresSePayPayment \? \(/);
  });
});
