import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  rateLimitIdentifier,
  rateLimitPolicies,
  rateLimitRequest
} from "@/lib/rate-limit";
import {
  getUploadStorage,
  logUploadFailure,
  UploadValidationError,
  validateImageUpload
} from "@/lib/upload";
import { resolveUploadAuthorization } from "@/lib/upload-authorization";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  const limited = admin
    ? await rateLimitIdentifier({
        policy: rateLimitPolicies.adminUploadAccount,
        identifier: admin.id
      })
    : await rateLimitRequest(request, rateLimitPolicies.uploadIp);
  if (limited) return limited;

  let isCustomerSignedIn = false;
  if (!admin) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    isCustomerSignedIn = Boolean(user);
  }

  const data = await request.formData();
  const file = data.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }

  const purpose = String(data.get("purpose") ?? "PRODUCT_INQUIRY_IMAGE");
  const isAdminUpload = Boolean(admin);
  const authorization = resolveUploadAuthorization({
    purpose,
    isAdminUpload,
    isCustomerSignedIn
  });
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status }
    );
  }

  try {
    const upload = await validateImageUpload(file);
    const url = await getUploadStorage().save(upload);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (!(error instanceof UploadValidationError)) {
      const requestId = requestIdFromRequest(request);
      logUploadFailure({
        error,
        operation: "upload.save",
        requestId
      });
      const response = NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      );
      response.headers.set("X-Request-Id", requestId);
      return response;
    }

    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }
}

function requestIdFromRequest(request: Request) {
  const supplied = request.headers.get("x-request-id")?.trim();
  if (supplied && /^[A-Za-z0-9._:-]{1,80}$/.test(supplied)) {
    return supplied;
  }

  return randomUUID();
}
