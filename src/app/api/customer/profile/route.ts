import { err, handlePrismaError, ok, zodDetails } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(9).max(20).optional(),
  email: z.string().trim().email().optional(),
  address: z.string().trim().min(5).optional(),
  province: z.string().trim().min(2).optional(),
  district: z.string().trim().min(2).optional(),
  ward: z.string().trim().min(2).optional(),
  zaloPhone: z.string().trim().optional(),
  instagramHandle: z.string().trim().optional(),
  preferredLanguage: z.enum(["vi", "en"]).optional(),
});

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return err("Unauthorized", 401);
  }

  try {
    const customer = await getPrisma().customer.findFirst({
      where: { email: user.email! },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        address: true,
        province: true,
        district: true,
        ward: true,
        zaloPhone: true,
        instagramHandle: true,
        preferredLanguage: true,
        createdAt: true
      }
    });

    if (!customer) {
      return err("Customer not found", 404);
    }

    return ok(customer);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return err("Unauthorized", 401);
  }

  const parsed = profileUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return err("Invalid profile data", 400, zodDetails(parsed.error));
  }

  try {
    const customer = await getPrisma().customer.findFirst({
      where: { email: user.email! },
      select: { id: true }
    });

    if (!customer) {
      return err("Customer not found", 404);
    }

    const updated = await getPrisma().customer.update({
      where: { id: customer.id },
      data: parsed.data,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        address: true,
        province: true,
        district: true,
        ward: true,
        zaloPhone: true,
        instagramHandle: true,
        preferredLanguage: true
      }
    });

    return ok(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}