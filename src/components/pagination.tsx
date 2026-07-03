"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  locale: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  locale
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const siblingCount = 1;

  // Generate range of page numbers with ellipses
  const getPaginationRange = () => {
    const totalPageNumbers = siblingCount + 5; // first, last, current, 2*sibling, 2*ellipsis

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "DOTS", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "DOTS", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "DOTS", ...middleRange, "DOTS", lastPageIndex];
    }

    return [];
  };

  const paginationRange = getPaginationRange();

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center sm:justify-end"
      role="navigation"
    >
      <ul className="flex flex-row items-center gap-1.5 flex-wrap justify-center">
        <li>
          <button
            aria-label={locale === "vi" ? "Trang trước" : "Previous page"}
            className="flex h-9 items-center justify-center border border-zinc-300 bg-white px-2.5 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-300 disabled:border-zinc-200"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            <ChevronLeft className="size-4 mr-1 translate-y-[-0.5px]" />
            <span>{locale === "vi" ? "Trước" : "Previous"}</span>
          </button>
        </li>

        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === "DOTS") {
            return (
              <li key={`dots-${idx}`}>
                <span className="flex h-9 w-9 items-center justify-center text-zinc-400">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">
                    {locale === "vi" ? "Nhiều trang hơn" : "More pages"}
                  </span>
                </span>
              </li>
            );
          }

          const isCurrent = pageNumber === currentPage;

          return (
            <li key={pageNumber}>
              <button
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex h-9 w-9 items-center justify-center border text-xs font-bold transition-colors",
                  isCurrent
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-900 hover:text-white"
                )}
                onClick={() => onPageChange(Number(pageNumber))}
                type="button"
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        <li>
          <button
            aria-label={locale === "vi" ? "Trang sau" : "Next page"}
            className="flex h-9 items-center justify-center border border-zinc-300 bg-white px-2.5 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-300 disabled:border-zinc-200"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            <span>{locale === "vi" ? "Sau" : "Next"}</span>
            <ChevronRight className="size-4 ml-1 translate-y-[-0.5px]" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
