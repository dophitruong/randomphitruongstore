import { err, handlePrismaError, ok, zodDetails } from "@/lib/api-response";
import { getCurrentAdmin, isManager } from "@/lib/admin-auth";
import {
  OrderLifecycleError,
  updateAdminOrderLifecycle
} from "@/lib/order-lifecycle";
import { getPrisma } from "@/lib/prisma";
import { orderStatusSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return err("Unauthorized", 401);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON payload", 400);
  }
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return err("Invalid status", 400, zodDetails(parsed.error));
  }
  const { id } = await context.params;
  try {
    const order = await updateAdminOrderLifecycle({
      prisma: getPrisma(),
      orderId: id,
      status: parsed.data.status,
      note: parsed.data.note,
      adminId: admin.id
    });
    return ok(order);
  } catch (error) {
    if (error instanceof OrderLifecycleError) {
      return err(error.message, error.status);
    }
    return handlePrismaError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return err("Unauthorized", 401);
  }
  if (!isManager(admin)) {
    return err("Only an owner or admin can delete orders", 403);
  }
  const { id } = await context.params;
  try {
    const order = await getPrisma().order.findUnique({
      where: { id },
      select: { payments: { where: { paymentStatus: "PAID" }, select: { id: true } } }
    });
    if (!order) {
      return err("Order not found", 404);
    }
    // Deleting cascades payments and history, so paid orders must be cancelled instead to keep the money trail.
    if (order.payments.length > 0) {
      return err("Đơn hàng đã có thanh toán, không thể xóa. Hãy chuyển trạng thái sang Đã hủy.", 409);
    }
    await getPrisma().order.delete({
      where: { id }
    });
    return ok({ deleted: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
