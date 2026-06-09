import { Clock3 } from "lucide-react";

export function OrderBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-black px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
      <Clock3 size={12} />
      {label}
    </span>
  );
}
