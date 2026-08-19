import { AdminOrdersManager } from "@/components/admin-orders-manager";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getPrisma().order.findMany({
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { createdAt: "asc" } }
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
