import { err, handlePrismaError, ok } from "@/lib/api-response";
import { getCurrentAdmin, isManager } from "@/lib/admin-auth";
import {
  CurrencySettingsError,
  updateCurrencySettings
} from "@/lib/currency-settings";

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return err("Unauthorized", 401);
  }
  if (!isManager(admin)) {
    return err("Only an owner or admin can change currency settings", 403);
  }

  try {
    const settings = await updateCurrencySettings({
      input: await request.json()
    });
    return ok(settings);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return err("Invalid JSON payload", 400);
    }
    if (error instanceof CurrencySettingsError) {
      return err(error.message, 400, error.details);
    }
    return handlePrismaError(error);
  }
}
