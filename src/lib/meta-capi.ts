import crypto from "crypto";

function hashValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

type MetaCapiEventOptions = {
  eventName: "Purchase";
  eventId: string;
  email?: string | null;
  phone?: string | null;
  value: number;
  currency: string;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
};

export async function sendMetaCapiEvent(options: MetaCapiEventOptions) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn("[Meta CAPI] Missing NEXT_PUBLIC_META_PIXEL_ID or META_ACCESS_TOKEN. Event skipped.");
    return;
  }

  // Hash user data
  const hashedEmail = hashValue(options.email);
  const hashedPhone = hashValue(options.phone);

  const payload = {
    data: [
      {
        event_name: options.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: options.eventId,
        action_source: "website",
        user_data: {
          em: hashedEmail ? [hashedEmail] : [],
          ph: hashedPhone ? [hashedPhone] : [],
          client_ip_address: options.clientIpAddress || undefined,
          client_user_agent: options.clientUserAgent || undefined,
        },
        custom_data: {
          currency: options.currency,
          value: options.value.toString(),
        },
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as { error?: unknown; events_received?: number };
    if (!response.ok) {
      console.error("[Meta CAPI] API returned error:", data);
    } else {
      console.log(`[Meta CAPI] Event ${options.eventName} (ID: ${options.eventId}) sent successfully. Response:`, data);
    }
  } catch (error) {
    console.error("[Meta CAPI] Network error sending event:", error);
  }
}
