"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminOrderDeleteButton({
  orderId,
  orderNumber,
  redirectOnDelete = true
}: {
  orderId: string;
  orderNumber: string;
  redirectOnDelete?: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa đơn hàng ${orderNumber} này không?\nThao tác này sẽ xóa vĩnh viễn đơn hàng và mọi dữ liệu liên quan và KHÔNG thể hoàn tác.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Xóa đơn hàng thất bại");
      }

      if (redirectOnDelete) {
        router.push("/admin/orders");
      } else {
        router.refresh();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Đã xảy ra lỗi khi xóa đơn hàng");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isDeleting}
      onClick={handleDelete}
      className="inline-flex size-9 items-center justify-center border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 shrink-0 cursor-pointer"
      title="Xóa đơn hàng"
    >
      <Trash2 size={16} className="translate-y-[-0.5px]" />
    </button>
  );
}
