"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminStatusSelect({
  endpoint,
  value,
  statuses
}: {
  endpoint: string;
  value: string;
  statuses: string[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function update(status: string) {
    setPending(true);
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setPending(false);
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <select
      className="min-h-9 border border-zinc-300 bg-white px-2 text-xs font-bold disabled:opacity-50"
      disabled={pending}
      onChange={(event) => update(event.target.value)}
      value={value}
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {status.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  );
}
