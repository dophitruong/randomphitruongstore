import { err, ok, zodDetails } from "@/lib/api-response";
import {
  rateLimitIdentifier,
  rateLimitPolicies,
  rateLimitRequest
} from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { registerInputSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const ipLimit = await rateLimitRequest(request, rateLimitPolicies.registrationIp);
  if (ipLimit) return ipLimit;

  const parsed = registerInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return err("Invalid registration data", 400, zodDetails(parsed.error));
  }

  const accountLimit = await rateLimitIdentifier({
    policy: rateLimitPolicies.registrationAccount,
    identifier: parsed.data.email.trim().toLowerCase()
  });
  if (accountLimit) return accountLimit;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName ?? ""
      }
    }
  });

  if (error) {
    // Supabase returns specific error messages — map the common ones
    if (error.message.includes("already registered")) {
      return err("An account with this email already exists", 409);
    }
    return err(error.message, 400);
  }

  return ok({ user: data.user }, 201);
}
