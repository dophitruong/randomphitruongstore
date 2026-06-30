import { err, handlePrismaError, ok, zodDetails } from "@/lib/api-response";
import { guestOrderAccessToken } from "@/lib/guest-order-cookie";
import { getPrisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { canAccessOrder } from "@/lib/order-access";
import {
  rateLimitIdentifier,
  rateLimitPolicies,
  rateLimitRequest
} from "@/lib/rate-limit";
import {
  buildSePayCancelUrl,
  buildSePayCheckout,
  buildSePayErrorUrl,
  buildSePaySuccessUrl,
  isLocalSePaySandbox
} from "@/lib/sepay";
import { SITE_URL } from "@/lib/constants";
import { z } from "zod";

const createPaymentSchema = z.object({
  orderId: z.string().uuid()
});

export async function POST(request: Request) {
  const ipLimit = await rateLimitRequest(
    request,
    rateLimitPolicies.paymentInitiationIp
  );
  if (ipLimit) return ipLimit;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON payload", 400);
  }

  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return err("Invalid payment data", 400, zodDetails(parsed.error));
  }

  const orderLimit = await rateLimitIdentifier({
    policy: rateLimitPolicies.paymentInitiationOrder,
    identifier: parsed.data.orderId
  });
  if (orderLimit) return orderLimit;

  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const order = await getPrisma().order.findUnique({
      where: { id: parsed.data.orderId },
      include: { payments: true, customer: true }
    });

    if (!order) {
      return err("Order not found", 404);
    }

    const accessToken =
      await guestOrderAccessToken(order.id) ??
      await guestOrderAccessToken(order.orderNumber);
    if (!canAccessOrder({
      authenticatedUserId: user?.id,
      customerSupabaseUserId: order.customer.supabaseUserId,
      accessToken,
      storedTokenHash: order.trackingToken
    })) {
      return err("Order not found", 404);
    }

    // Validate order status
    if (order.status !== "PENDING_ONLINE_PAYMENT") {
      return err("Order is not pending online payment", 400);
    }

    // Validate payment method
    if (order.paymentMethod !== "ONLINE_100_SEPAY") {
      return err("Invalid payment method for this order", 400);
    }

    const payment = order.payments.find(p => p.paymentStatus === "PENDING");
    if (!payment) {
      return err("No pending payment found", 400);
    }

    // Use stored payment amount and description, not client-provided
    const amount = payment.amount;
    const description = `Thanh toan don hang ${order.orderNumber}`;

    await getPrisma().payment.update({
      where: { id: payment.id },
      data: {
        gatewayProvider: "sepay",
        gatewayOrderId: order.orderNumber
      }
    });

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const origin = host ? `${protocol}://${host}` : SITE_URL;

    if (isLocalSePaySandbox()) {
      return ok({
        paymentUrl: `${origin}/api/payment/sepay-placeholder?orderId=${encodeURIComponent(order.orderNumber)}`
      });
    }

    return ok({
      checkout: buildSePayCheckout({
        orderNumber: order.orderNumber,
        amount,
        description,
        customerId: order.customerId,
        successUrl: buildSePaySuccessUrl(order.orderNumber, origin),
        errorUrl: buildSePayErrorUrl(order.orderNumber, origin),
        cancelUrl: buildSePayCancelUrl(order.orderNumber, origin)
      })
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
