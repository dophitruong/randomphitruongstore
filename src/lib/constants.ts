export const BRAND_NAME = "random.phitruong";
export const ZALO_PHONE = "0388390482";
export const ZALO_URL = `https://zalo.me/${ZALO_PHONE}`;
export const INSTAGRAM_URL = "https://www.instagram.com/random.phitruong4";
export const TIKTOK_URL = "https://www.tiktok.com/@random.phitruong";
export const FACEBOOK_URL =
  "https://www.facebook.com/share/1BHqMuddbH/?mibextid=wwXIfr";
export const CONTACT_EMAIL = "randomphitruong@gmail.com";
export const HOTLINE = "0388390482";
export const WORKING_HOURS = "09:00 - 22:00 (Hàng ngày / Everyday)";

export const BANK_DETAILS = {
  bank: "BIDV - PGD Thanh Xuân Bắc",
  accountNumber: "2153102265",
  // The QR code has always used this number (likely a SePay virtual account forwarding to accountNumber).
  qrAccountNumber: "9624715031978",
  accountHolder: "DO PHI TRUONG"
} as const;

export function bankTransferQrUrl(amount?: number, orderNumber?: string) {
  const params = new URLSearchParams({
    bank: "BIDV",
    acc: BANK_DETAILS.qrAccountNumber,
    template: "compact",
    showinfo: "true",
    fullacc: "true",
    holder: BANK_DETAILS.accountHolder,
    store: "randomphitruong"
  });
  if (amount) params.set("amount", String(amount));
  if (orderNumber) params.set("des", orderNumber);
  return `https://qr.sepay.vn/img?${params}`;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
