import { err, ok, zodDetails } from "@/lib/api-response";
import {
  rateLimitIdentifier,
  rateLimitPolicies,
  rateLimitRequest
} from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { loginInputSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const ipLimit = await rateLimitRequest(request, rateLimitPolicies.customerLoginIp);
  if (ipLimit) return ipLimit;

  const parsed = loginInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return err("Invalid credentials", 400, zodDetails(parsed.error));
  }

  const accountLimit = await rateLimitIdentifier({
    policy: rateLimitPolicies.customerLoginAccount,
    identifier: parsed.data.email.trim().toLowerCase()
  });
  if (accountLimit) return accountLimit;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      captchaToken: parsed.data.captchaToken
    }
  });

  if (error) {
    const errorMsg = error.message?.toLowerCase() ?? "";
    if (
      errorMsg.includes("email not confirmed") ||
      errorMsg.includes("email_not_confirmed")
    ) {
      return err(
        "Email chưa được kích hoạt. Vui lòng kiểm tra hộp thư email (kể cả mục Spam) và nhấp vào liên kết xác nhận để kích hoạt tài khoản.",
        400
      );
    }
    if (errorMsg.includes("captcha")) {
      return err(
        "Xác thực CAPTCHA không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
        400
      );
    }
    return err("Email hoặc mật khẩu không chính xác", 401);
  }

  // Note: Session duration ("Remember me") is configured in Supabase Dashboard
  // under Authentication > Settings > JWT expiry and Refresh token rotation.
  // The rememberMe field is accepted for future extensibility.

  return ok({ user: data.user });
}
