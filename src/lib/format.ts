import type { Locale } from "@/i18n/request";

export function formatPrice(value: number, locale: Locale = "vi") {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value);
}

export function categoryLabel(
  category: string,
  locale: Locale = "vi"
): string {
  const labels: Record<string, Record<Locale, string>> = {
    SUKAJAN: { vi: "Sukajan", en: "Sukajan" },
    BOMBER: { vi: "Bomber Jacket", en: "Bomber Jacket" },
    HOODIE: { vi: "Hoodie", en: "Hoodie" },
    JACKET: { vi: "Áo khoác", en: "Jacket" },
    SEASONAL: { vi: "Order theo mùa", en: "Seasonal Order" },
    PANTS: { vi: "Quần", en: "Pants" },
    "T-SHIRT": { vi: "T-Shirt", en: "T-Shirt" },
    TSHIRT: { vi: "T-Shirt", en: "T-Shirt" },
    SWEATER: { vi: "Sweater", en: "Sweater" }
  };

  const key = category.toUpperCase();
  return labels[key]?.[locale] ?? category;
}

export function orderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `ODR-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

export function toValidDate(value: Date | string | number | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatVietnamDateTime(
  value: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = toValidDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options
  }).format(date);
}

export function formatVietnamDate(
  value: Date | string | number | null | undefined
): string {
  const date = toValidDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function formatVietnamTime(
  value: Date | string | number | null | undefined
): string {
  const date = toValidDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}
