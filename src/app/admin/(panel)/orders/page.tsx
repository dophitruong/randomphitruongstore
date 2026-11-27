import { AdminOrdersManager } from "@/components/admin-orders-manager";
import { requireAdmin } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  // shortcut: loads every order (only the list columns) so the client-side search finds old orders; move search to the server past a few thousand orders.
  const orders = await getPrisma().order.findMany({
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      paymentMethod: true,
      status: true,
      createdAt: true,
      customer: { select: { fullName: true, phone: true } },
      items: { select: { id: true, productName: true, quantity: true } },
      payments: {
        select: { id: true, paymentType: true, paymentStatus: true },
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <header className="mb-6">
        <p className="eyebrow text-zinc-500">Xử lý đơn hàng</p>
        <h1 className="mt-2 text-4xl font-black">Đơn hàng</h1>
      </header>

      <AdminOrdersManager initialOrders={orders} />
    </>
  );
}
