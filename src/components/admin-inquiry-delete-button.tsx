"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminInquiryDeleteButton({
  inquiryId,
  customerName
}: {
  inquiryId: string;
  customerName: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa yêu cầu đặt hàng của ${customerName} này không?\nThao tác này sẽ xóa vĩnh viễn yêu cầu này và KHÔNG thể hoàn tác.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/order-requests/${inquiryId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Xóa yêu cầu thất bại");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Đã xảy ra lỗi khi xóa yêu cầu");
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
      title="Xóa yêu cầu"
    >
      <Trash2 size={16} className="translate-y-[-0.5px]" />
    </button>
  );
}
