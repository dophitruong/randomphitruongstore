import type { OrderInput } from "@/lib/validations";

export function normalizeEmail(email: string | null | undefined) {
  const trimmed = email?.trim().toLowerCase();
  return trimmed || null;
}

export function buildShippingAddressSnapshot(input: Pick<
  OrderInput,
  "fullName" | "phone" | "address" | "province" | "district" | "ward"
>) {
  return {
    recipientName: input.fullName,
    phone: input.phone,
    country: "Vietnam",
    provinceCity: input.province,
    district: input.district,
    ward: input.ward,
    streetAddress: input.address,
    fullAddress: [
      input.address,
      input.ward,
      input.district,
      input.province
    ].join(", "),
    isInternational: false
  };
}
