export const ADMIN_UPLOAD_AUTH_ERROR =
  "Admin session expired. Please sign in again to upload product images.";

export type UploadAuthorization =
  | { ok: true; requiresIntent: boolean }
  | { ok: false; status: 400 | 401; error: string };

export function resolveUploadAuthorization({
  purpose,
  isAdminUpload
}: {
  purpose: string;
  isAdminUpload: boolean;
}): UploadAuthorization {
  if (purpose !== "PRODUCT_INQUIRY_IMAGE" && purpose !== "ADMIN_PRODUCT_IMAGE") {
    return { ok: false, status: 400, error: "Invalid upload purpose" };
  }

  if (purpose === "ADMIN_PRODUCT_IMAGE" && !isAdminUpload) {
    return { ok: false, status: 401, error: ADMIN_UPLOAD_AUTH_ERROR };
  }

  return { ok: true, requiresIntent: !isAdminUpload };
}
