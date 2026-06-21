import { SITE_URL } from "@/lib/constants";
import { createHmac, timingSafeEqual } from "crypto";

interface SePayCreatePaymentResponse {
  success: boolean;
  data?: {
    paymentUrl: string;
    transactionId: string;
    orderCode: string;
  };
  message?: string;
}

interface SePayWebhookPayload {
  transactionId: string;
  orderCode: string;
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  gateway: string;
  description?: string;
  accountNumber?: string;
  referenceCode?: string;
  transactionDate: string;
  content: string;
  transferAmount: number;
  accumulated: number;
  subAccount: string | null;
}

interface SePayInitResponse {
  success: boolean;
  data?: {
    checkoutUrl: string;
    transactionId: string;
  };
  message?: string;
}

export async function createSePayPayment({
  orderNumber,
  amount,
  description,
  returnUrl,
  cancelUrl
}: {
  orderNumber: string;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ paymentUrl: string; transactionId: string }> {
  if (process.env.SEPAY_ENVIRONMENT === "sandbox") {
    return {
      paymentUrl: `${SITE_URL}/api/payment/sepay-placeholder?orderId=${encodeURIComponent(orderNumber)}`,
      transactionId: `sandbox-${orderNumber}-${Date.now()}`
    };
  }

  const merchantId = process.env.SEPAY_MERCHANT_ID;
  const secretKey = process.env.SEPAY_SECRET_KEY;
  const apiUrl = process.env.SEPAY_API_URL ?? "https://my.sepay.vn/v1/checkout/init";

  if (!merchantId || !secretKey) {
    throw new Error("SEPAY_MERCHANT_ID and SEPAY_SECRET_KEY not configured");
  }

  const payload = {
    merchantId,
    orderCode: orderNumber,
    amount,
    description,
    returnUrl,
    cancelUrl
  };

  const signature = generateSignature(payload, secretKey);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Merchant-Id": merchantId,
      "X-Signature": signature
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SePay API error: ${response.status} ${errorText}`);
  }

  const data: SePayInitResponse = await response.json();

  if (!data.success || !data.data?.checkoutUrl) {
    throw new Error(data.message ?? "Failed to create SePay payment");
  }

  return {
    paymentUrl: data.data.checkoutUrl,
    transactionId: data.data.transactionId || orderNumber
  };
}

function generateSignature(payload: Record<string, unknown>, secretKey: string): string {
  const sortedKeys = Object.keys(payload).sort();
  const signatureString = sortedKeys
    .map((key) => `${key}=${payload[key]}`)
    .join("&");

  return createHmac("sha256", secretKey)
    .update(signatureString)
    .digest("hex");
}

export function verifySePayWebhook(
  request: Request,
  payload: SePayWebhookPayload
): boolean {
  const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return false;
  }

  const signature = request.headers.get("X-Sepay-Signature") ??
                    request.headers.get("X-Webhook-Signature") ??
                    request.headers.get("X-Signature");

  if (!signature) {
    return false;
  }

  const sortedKeys = Object.keys(payload).sort();
  const signatureString = sortedKeys
    .map((key) => `${key}=${payload[key as keyof SePayWebhookPayload]}`)
    .join("&");

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(signatureString)
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export function buildSePaySuccessUrl(orderNumber: string): string {
  return `${SITE_URL}/checkout/success?orderId=${encodeURIComponent(orderNumber)}&gateway=sepay`;
}

export function buildSePayCancelUrl(orderNumber: string): string {
  return `${SITE_URL}/checkout/cancel?orderId=${encodeURIComponent(orderNumber)}&gateway=sepay`;
}

export function buildSePayWebhookUrl(): string {
  return `${SITE_URL}/api/payment/sepay/webhook`;
}