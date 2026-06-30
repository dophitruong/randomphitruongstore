"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductDescription({
  description,
  readMoreLabel = "Đọc thêm",
  readLessLabel = "Thu gọn"
}: {
  description: string;
  readMoreLabel?: string;
  readLessLabel?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldClamp = description.length > 200;

  if (!shouldClamp) {
    return <p className="mt-6 text-sm leading-7 text-zinc-600">{description}</p>;
  }

  return (
    <div className="mt-6">
      <p
        className={cn(
          "text-sm leading-7 text-zinc-600 transition-all duration-300",
          !isExpanded && "line-clamp-3 overflow-hidden"
        )}
      >
        {description}
      </p>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-xs font-bold uppercase tracking-wider text-black underline hover:text-zinc-600 transition-colors"
      >
        {isExpanded ? readLessLabel : readMoreLabel}
      </button>
    </div>
  );
}
