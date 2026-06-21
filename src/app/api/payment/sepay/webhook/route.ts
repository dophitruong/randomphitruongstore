import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { parseSePayIpn, verifySePayIpnSecret } from "@/lib/sepay";

export async function POST(request: Request) {
  if (!verifySePayIpnSecret(request.headers)) {
    console.error("[SePay IPN] Invalid X-Secret-Key");
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = parseSePayIpn(await request.json());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid IPN payload" }, { status: 400 });
  }

  if (
    payload.notification_type !== "ORDER_PAID" ||
    payload.order.order_status !== "CAPTURED" ||
    payload.transaction.transaction_status !== "APPROVED"
  ) {
    return NextResponse.json({ success: true });
  }

  try {
    const order = await getPrisma().order.findUnique({
      where: { orderNumber: payload.order.order_invoice_number },
      include: { payments: true }
    });

    if (!order || order.paymentMethod !== "ONLINE_100_SEPAY") {
      console.error(`[SePay IPN] Order not found: ${payload.order.order_invoice_number}`);
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const transactionId = payload.transaction.transaction_id;
    const payment = order.payments.find(
      (item) =>
        item.gatewayTransactionId === transactionId || item.paymentStatus === "PENDING"
    );
    if (!payment) {
      return NextResponse.json({ success: true });
    }

    if (
      payment.gatewayTransactionId === transactionId &&
      payment.paymentStatus === "PAID"
    ) {
      return NextResponse.json({ success: true });
    }

    const gatewayResponse = JSON.parse(JSON.stringify(payload)) as Prisma.JsonObject;

    await getPrisma().$transaction(async (transaction) => {
      await transaction.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          gatewayProvider: "sepay",
          gatewayOrderId: payload.order.order_invoice_number,
          gatewayResponse,
          gatewayTransactionId: transactionId,
          transactionReference: payload.transaction.id
        }
      });

      await transaction.order.update({
        where: { id: order.id },
        data: {
          status: "PAID_FULL",
          paymentOption: "ONLINE_100",
          remainingAmount: 0
        }
      });

      await transaction.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "PAID_FULL",
          note: `SePay payment confirmed. Amount: ${payload.transaction.transaction_amount}. Transaction: ${transactionId}`
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SePay IPN] Processing failed", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
