"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminStatusSelect({
  endpoint,
  value,
  statuses,
  statusLabels = {}
}: {
  endpoint: string;
  value: string;
  statuses: string[];
  statusLabels?: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(status: string) {
    setError(null);
    setPending(true);
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to update order status / Lỗi khi cập nhật trạng thái");
      }
    } catch {
      setError("Failed to update order status / Lỗi khi cập nhật trạng thái");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <select
        className="min-h-10 min-w-44 border border-zinc-300 bg-white px-3 text-base md:text-xs font-bold text-zinc-900 outline-none transition-colors hover:border-zinc-500 focus:border-[#a72b1f] focus:ring-2 focus:ring-[#a72b1f]/15 disabled:cursor-wait disabled:bg-zinc-100 disabled:text-zinc-400"
        disabled={pending}
        onChange={(event) => update(event.target.value)}
        value={value}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status] ?? status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
