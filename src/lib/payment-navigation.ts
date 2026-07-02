export type PaymentCheckoutData = {
  paymentUrl?: string;
  checkout?: {
    action: string;
    method: "POST";
    fields: Record<string, string | number | undefined>;
  };
};

export function hasPaymentDestination(
  data: PaymentCheckoutData | null | undefined
): data is PaymentCheckoutData {
  if (!data) return false;
  if (typeof data.paymentUrl === "string" && data.paymentUrl.trim()) {
    return true;
  }

  const checkout = data.checkout;
  return Boolean(
    checkout &&
      typeof checkout.action === "string" &&
      checkout.action.trim() &&
      checkout.method === "POST" &&
      checkout.fields &&
      typeof checkout.fields === "object"
  );
}

export function navigateToPayment(data: PaymentCheckoutData) {
  if (!hasPaymentDestination(data)) {
    return false;
  }

  if (data.paymentUrl?.trim()) {
    window.location.assign(data.paymentUrl);
    return true;
  }

  if (!data.checkout) {
    return false;
  }

  const form = document.createElement("form");
  form.action = data.checkout.action;
  form.method = data.checkout.method;

  for (const [name, value] of Object.entries(data.checkout.fields)) {
    if (value === undefined) continue;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  return true;
}
