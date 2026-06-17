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
      return ok([]);
    }

    const orders = await getPrisma().order.findMany({
      where: { customerId: customer.id },
      include: {
        items: {
          include: {
            product: {
              select: { nameVi: true, nameEn: true, slug: true }
            }
          }
        },
        shippingAddress: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(orders);
  } catch (error) {
    return handlePrismaError(error);
  }
}