import { err, handlePrismaError, ok, zodDetails } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/customer-account";
import { buildSePaySuccessUrl, buildSePayCancelUrl, createSePayPayment } from "@/lib/sepay";
import { z } from "zod";

const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(request: Request) {
  const parsed = createPaymentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return err("Invalid payment data", 400, zodDetails(parsed.error));
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = normalizeEmail(user?.email);

    const order = await getPrisma().order.findUnique({
      where: { id: parsed.data.orderId },
      include: { payments: true, customer: true }
    });

    if (!order) {
      return err("Order not found", 404);
    }

    // Ownership check: if user is authenticated, order must belong to them
    if (userEmail && order.customer?.email !== userEmail) {
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

    const successUrl = buildSePaySuccessUrl(order.orderNumber);
    const cancelUrl = buildSePayCancelUrl(order.orderNumber);

    const { paymentUrl, transactionId } = await createSePayPayment({
      orderNumber: order.orderNumber,
      amount,
      description,
      returnUrl: successUrl,
      cancelUrl
    });

    await getPrisma().payment.update({
      where: { id: payment.id },
      data: {
        gatewayProvider: "sepay",
        gatewayTransactionId: transactionId,
        gatewayOrderId: order.orderNumber
      }
    });

    return ok({ paymentUrl });
  } catch (error) {
    return handlePrismaError(error);
  }
}