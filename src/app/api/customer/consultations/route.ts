import { err, handlePrismaError, ok } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return err("Unauthorized", 401);
  }

  try {
    const customer = await getPrisma().customer.findFirst({
      where: { email: user.email! },
      select: { id: true }
    });

    if (!customer) {
      return ok({ inquiries: [] });
    }

    const inquiries = await getPrisma().productInquiry.findMany({
      where: { customerId: customer.id },
      include: {
        product: {
          select: { nameVi: true, nameEn: true, slug: true }
        },
        images: true
      },
      orderBy: { createdAt: "desc" }
    });

    return ok({ inquiries });
  } catch (error) {
    return handlePrismaError(error);
  }
}
