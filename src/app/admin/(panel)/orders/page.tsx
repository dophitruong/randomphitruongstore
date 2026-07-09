import Link from "next/link";
import { AdminStatusSelect } from "@/components/admin-status-select";
import { AdminTable } from "@/components/admin-table";
import { AdminOrderDeleteButton } from "@/components/admin-order-delete-button";
import { StatusBadge } from "@/components/status-badge";
import { formatPrice } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statuses = [
  "PENDING_DEPOSIT",
  "DEPOSIT_CONFIRMED",
  "PENDING_ONLINE_PAYMENT",
  "PAID_FULL",
  "ORDERED_FROM_SUPPLIER",
  "ARRIVED_AT_SHOP",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED"
];

const statusLabels: Record<string, string> = {
  PENDING_DEPOSIT: "Chờ đặt cọc",
  DEPOSIT_CONFIRMED: "Đã xác nhận cọc",
  PENDING_ONLINE_PAYMENT: "Chờ thanh toán online",
  PAID_FULL: "Đã thanh toán đủ",
  ORDERED_FROM_SUPPLIER: "Đã đặt hàng NCC",
  ARRIVED_AT_SHOP: "Hàng về kho",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const paymentMethodLabels: Record<string, string> = {
  DEPOSIT_50_BANK_ZALO: "Bank/Zalo (cọc 50%)",
  ONLINE_100_SEPAY: "SePay (100%)",
  ONLINE_100_VNPAY: "VNPay (100%)",
  ONLINE_100_MOMO: "MoMo (100%)",
};

const paymentTypeLabels: Record<string, string> = {
  DEPOSIT: "Cọc",
  REMAINING_BALANCE: "Còn lại",
  FULL_PAYMENT: "Toàn bộ",
  SHIPPING_FEE: "Phí ship",
};

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
      <header className="mb-8">
        <p className="eyebrow text-zinc-500">Xử lý đơn hàng</p>
        <h1 className="mt-2 text-4xl font-black">Đơn hàng</h1>
      </header>

      {/* Desktop view */}
      <div className="hidden md:block">
        <AdminTable
          emptyMessage="Chưa có đơn hàng nào."
          headers={["Đơn hàng", "Khách hàng", "Sản phẩm", "Tổng tiền", "Thanh toán", "Trạng thái", "Cập nhật"]}
        >
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-4">
                <Link
                  className="font-bold underline underline-offset-4"
                  href={`/admin/orders/${order.id}`}
                >
                  {order.orderNumber}
                </Link>
                <p className="mt-1 text-xs text-zinc-500">
                  {order.createdAt.toLocaleDateString("vi-VN")}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="font-bold">{order.customer.fullName}</p>
                <p className="text-xs text-zinc-500">{order.customer.phone}</p>
              </td>
              <td className="px-4 py-4 text-sm">
                <p className="font-bold">{order.items.length} sản phẩm</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                </p>
              </td>
              <td className="px-4 py-4 font-bold">{formatPrice(order.totalAmount)}</td>
              <td className="px-4 py-4 text-xs">
                <p className="font-bold">
                  {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
                </p>
                <div className="mt-1 space-y-1">
                  {order.payments.map((p) => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <span className="text-zinc-500">{paymentTypeLabels[p.paymentType] ?? p.paymentType}:</span>
                      <StatusBadge status={p.paymentStatus} />
                    </div>
                  ))}
                  {order.payments.length === 0 && (
                    <span className="text-zinc-400">Chưa có thanh toán</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <AdminStatusSelect
                    endpoint={`/api/orders/${order.id}`}
                    statuses={statuses}
                    statusLabels={statusLabels}
                    value={order.status}
                  />
                  <AdminOrderDeleteButton
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    redirectOnDelete={false}
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>

      {/* Mobile view */}
      <div className="block md:hidden space-y-4">
        {orders.length === 0 ? (
          <div className="border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400">
            Chưa có đơn hàng nào.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm space-y-3">
              <div className="flex justify-between items-start border-b border-zinc-100 pb-2">
                <div>
                  <Link
                    className="font-bold underline underline-offset-4 text-sm"
                    href={`/admin/orders/${order.id}`}
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {order.createdAt.toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-zinc-500 font-semibold">Khách hàng</p>
                  <p className="font-bold text-zinc-900 mt-0.5">{order.customer.fullName}</p>
                  <p className="text-zinc-500 mt-0.5">{order.customer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 font-semibold">Tổng cộng</p>
                  <p className="font-black text-sm text-[#a72b1f] mt-0.5">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>

              {/* Items detail */}
              <div className="bg-zinc-50 p-2.5 rounded text-xs space-y-1">
                <p className="font-bold text-zinc-700">{order.items.length} sản phẩm:</p>
                <p className="text-zinc-600 leading-relaxed">
                  {order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                </p>
              </div>

              {/* Payment Details */}
              <div className="bg-[#faf9f7] p-2.5 border border-zinc-200/60 rounded text-xs space-y-1.5">
                <p className="font-semibold text-zinc-700">
                  Thanh toán: <span className="font-bold">{paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {order.payments.map((p) => (
                    <div key={p.id} className="flex items-center gap-1 bg-white border border-zinc-200 px-1.5 py-0.5 rounded">
                      <span className="text-zinc-500 text-[10px]">{paymentTypeLabels[p.paymentType] ?? p.paymentType}:</span>
                      <StatusBadge status={p.paymentStatus} />
                    </div>
                  ))}
                  {order.payments.length === 0 && (
                    <span className="text-zinc-400 italic">Chưa có thanh toán</span>
                  )}
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-xs text-zinc-500">Cập nhật:</span>
                <div className="flex items-center gap-2">
                  <AdminStatusSelect
                    endpoint={`/api/orders/${order.id}`}
                    statuses={statuses}
                    statusLabels={statusLabels}
                    value={order.status}
                  />
                  <AdminOrderDeleteButton
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    redirectOnDelete={false}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
