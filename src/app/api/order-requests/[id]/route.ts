import { err, handlePrismaError, ok } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { updateProductInquiryStatus } from "@/lib/product-inquiry";
import { productInquiryStatusSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return err("Unauthorized", 401);
  }
  const parsed = productInquiryStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return err("Invalid status", 400);
  }
  const { id } = await context.params;
  try {
    const inquiry = await updateProductInquiryStatus(
      getPrisma(),
      id,
      parsed.data.status
    );
    return ok(inquiry);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return err("Unauthorized", 401);
  }
  const { id } = await context.params;
  try {
    const inquiry = await getPrisma().productInquiry.findUnique({
      where: { id }
    });
    if (!inquiry) {
      return err("Order request not found", 404);
    }
    await getPrisma().productInquiry.delete({
      where: { id }
    });
    return ok({ deleted: true });
  } catch (error) {
    console.error("[DELETE Order Request Error]", error);
    return handlePrismaError(error);
  }
}
