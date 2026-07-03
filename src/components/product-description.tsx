"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { parseMarkdown } from "@/lib/markdown";

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
  const shouldClamp = description.length > 220;

  const parsedContent = useMemo(() => {
    return parseMarkdown(description);
  }, [description]);

  if (!shouldClamp) {
    return <div className="mt-6 space-y-1">{parsedContent}</div>;
  }

  return (
    <div className="mt-6">
      <div
        className={cn(
          "transition-all duration-300 space-y-1",
          !isExpanded && "line-clamp-4 overflow-hidden max-h-[140px]"
        )}
      >
        {parsedContent}
      </div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-xs font-bold uppercase tracking-wider text-black underline hover:text-[#a72b1f] transition-colors"
      >
        {isExpanded ? readLessLabel : readMoreLabel}
      </button>
    </div>
  );
}
