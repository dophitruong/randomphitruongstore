import { paymentResultResponse } from "@/lib/payment-placeholder";
import { getPrisma } from "@/lib/prisma";
import {
  isSePaySandboxMethod,
  sepaySandboxReference,
  SEPAY_SANDBOX_PROVIDER
} from "@/lib/sepay-sandbox";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("orderId")?.trim();
  const status = url.searchParams.get("status");

  if (!orderNumber) {
    return paymentResultResponse({
      gateway: "SePay Sandbox",
      title: "Missing order",
      body: "No order number was provided for this payment result.",
      orderNumber: "Unknown"
    });
  }

  const order = await getPrisma().order.findUnique({
    where: { orderNumber },
    include: { payments: true }
  });

  if (!order || !isSePaySandboxMethod(order.paymentMethod)) {
    return paymentResultResponse({
      gateway: "SePay Sandbox",
      title: "Payment session unavailable",
      body: "This order is not available for SePay sandbox payment.",
      orderNumber
    });
  }

  const isPaid = order.status === "PAID_FULL" || order.payments.some(p => p.paymentStatus === "PAID");

  if (isPaid) {
    return paymentResultResponse({
      gateway: "SePay Sandbox",
      title: "Payment confirmed",
      body: "The payment has been verified and your order is being processed.",
      orderNumber: order.orderNumber,
      primaryHref: "/account",
      primaryLabel: "View account"
    });
  }

  if (status === "cancelled") {
    return paymentResultResponse({
      gateway: "SePay Sandbox",
      title: "Payment cancelled",
      body: "The sandbox payment was cancelled. The order remains pending online payment.",
      orderNumber: order.orderNumber
    });
  }

  return paymentResultResponse({
    gateway: "SePay Sandbox",
    title: "Payment pending",
    body: "We are waiting for payment confirmation. This may take a few minutes.",
    orderNumber: order.orderNumber
  });
}
