export const ADMIN_UPLOAD_AUTH_ERROR =
  "Admin session expired. Please sign in again to upload product images.";

export const CUSTOMER_UPLOAD_AUTH_ERROR =
  "Vui lòng đăng nhập để tải ảnh lên.";

export type UploadAuthorization =
  | { ok: true }
  | { ok: false; status: 400 | 401; error: string };

export function resolveUploadAuthorization({
  purpose,
  isAdminUpload,
  isCustomerSignedIn
}: {
  purpose: string;
  isAdminUpload: boolean;
  isCustomerSignedIn: boolean;
}): UploadAuthorization {
  if (purpose !== "PRODUCT_INQUIRY_IMAGE" && purpose !== "ADMIN_PRODUCT_IMAGE") {
    return { ok: false, status: 400, error: "Invalid upload purpose" };
  }

  if (purpose === "ADMIN_PRODUCT_IMAGE" && !isAdminUpload) {
    return { ok: false, status: 401, error: ADMIN_UPLOAD_AUTH_ERROR };
  }

  if (!isAdminUpload && !isCustomerSignedIn) {
    return { ok: false, status: 401, error: CUSTOMER_UPLOAD_AUTH_ERROR };
  }

  return { ok: true };
}
