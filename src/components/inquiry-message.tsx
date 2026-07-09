"use client";

import { useState } from "react";

export function InquiryMessage({ message }: { message: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!message) return <span>-</span>;

  // Check if it's long or has multiple lines
  const hasMultipleLines = message.includes("\n");
  const isLong = message.length > 50 || hasMultipleLines;

  if (!isLong) {
    return (
      <p className="mt-1 text-xs text-zinc-500 whitespace-pre-wrap select-text">
        {message}
      </p>
    );
  }

  return (
    <div className="mt-1">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`text-xs text-zinc-500 cursor-pointer select-text transition-all duration-200 ${
          isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"
        } hover:bg-zinc-50 p-1 rounded border border-transparent hover:border-zinc-200`}
        title="Click to view full message"
      >
        {message}
      </div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1 text-[10px] font-bold text-[#a72b1f] hover:underline cursor-pointer"
      >
        {isExpanded ? "Show less" : "Show more..."}
      </button>
    </div>
  );
}
