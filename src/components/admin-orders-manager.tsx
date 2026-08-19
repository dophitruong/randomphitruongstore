"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { AdminStatusSelect } from "@/components/admin-status-select";
import { AdminTable } from "@/components/admin-table";
import { AdminOrderDeleteButton } from "@/components/admin-order-delete-button";
import { StatusBadge } from "@/components/status-badge";
import { formatPrice, formatVietnamDateTime } from "@/lib/format";

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: Date | string;
  customer: {
    fullName: string;
    phone: string;
  };
  items: {
    id: string;
    productName: string;
    quantity: number;
  }[];
  payments: {
    id: string;
    paymentType: string;
    paymentStatus: string;
  }[];
};

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
  CANCELLED: "Đã hủy"
};

const paymentMethodLabels: Record<string, string> = {
  DEPOSIT_50_BANK_ZALO: "Bank/Zalo (cọc 50%)",
  ONLINE_100_SEPAY: "SePay (100%)",
  ONLINE_100_VNPAY: "VNPay (100%)",
  ONLINE_100_MOMO: "MoMo (100%)"
};

const paymentTypeLabels: Record<string, string> = {
  DEPOSIT: "Cọc",
  REMAINING_BALANCE: "Còn lại",
  FULL_PAYMENT: "Toàn bộ",
  SHIPPING_FEE: "Phí ship"
};

export function filterOrders(orders: AdminOrderRow[], searchQuery: string): AdminOrderRow[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return orders;

  return orders.filter((order) => {
    // Check order number match (case-insensitive, partial)
    if (order.orderNumber.toLowerCase().includes(query)) {
      return true;
    }

    // Check product name match in items (case-insensitive, partial)
    const hasMatchingProduct = order.items.some((item) =>
      item.productName.toLowerCase().includes(query)
    );
    if (hasMatchingProduct) {
      return true;
    }

    return false;
  });
}

export function AdminOrdersManager({
  initialOrders
}: {
  initialOrders: AdminOrderRow[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    return filterOrders(initialOrders, searchQuery);
  }, [initialOrders, searchQuery]);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Search Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-lg">
          <label className="sr-only" htmlFor="admin-order-search">
            Tìm kiếm đơn hàng
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            id="admin-order-search"
            className="min-h-11 w-full rounded-none border border-zinc-300 bg-white py-2 pl-10 pr-10 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#a72b1f] focus:ring-2 focus:ring-[#a72b1f]/15"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm..."
            type="search"
            value={searchQuery}
          />
          {searchQuery ? (
            <button
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700"
              onClick={() => setSearchQuery("")}
              type="button"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        <div className="text-xs font-bold text-zinc-500">
          {hasSearch ? (
            <span>
              Tìm thấy <strong className="text-zinc-900">{filteredOrders.length}</strong> / {initialOrders.length} đơn hàng
            </span>
          ) : (
            <span>Tổng cộng: <strong className="text-zinc-900">{initialOrders.length}</strong> đơn hàng</span>
          )}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <AdminTable
          emptyMessage={
            hasSearch
              ? `Không tìm thấy đơn hàng nào phù hợp với từ khóa "${searchQuery.trim()}".`
              : "Chưa có đơn hàng nào."
          }
          headers={[
            "Đơn hàng",
            "Khách hàng",
            "Sản phẩm",
            "Tổng tiền",
            "Thanh toán",
            "Trạng thái",
            "Cập nhật"
          ]}
        >
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-4">
                <Link
                  className="font-bold underline underline-offset-4 hover:text-[#a72b1f]"
                  href={`/admin/orders/${order.id}`}
                >
                  {order.orderNumber}
                </Link>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatVietnamDateTime(order.createdAt)}
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
        {filteredOrders.length === 0 ? (
          <div className="border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 space-y-2">
            <p>
              {hasSearch
                ? `Không tìm thấy đơn hàng nào phù hợp với từ khóa "${searchQuery.trim()}".`
                : "Chưa có đơn hàng nào."}
            </p>
            {hasSearch ? (
              <button
                className="text-xs font-bold text-[#a72b1f] hover:underline"
                onClick={() => setSearchQuery("")}
                type="button"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            ) : null}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm space-y-3">
              <div className="flex justify-between items-start border-b border-zinc-100 pb-2">
                <div>
                  <Link
                    className="font-bold underline underline-offset-4 text-sm hover:text-[#a72b1f]"
                    href={`/admin/orders/${order.id}`}
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {formatVietnamDateTime(order.createdAt)}
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
    </div>
  );
}
