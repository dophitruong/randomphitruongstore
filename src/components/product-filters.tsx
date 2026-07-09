"use client";

import { ChevronDown, SlidersHorizontal, X, Check, Search } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import type { Locale } from "@/i18n/request";
import { Pagination } from "./pagination";
import { cn } from "@/lib/utils";
import {
  productMatchesVariantFilters,
  productVariantColors,
  productVariantSizes
} from "@/lib/product-catalog";
import { productBasePrice } from "@/lib/product-pricing";
import type { CatalogProductDTO, ProductCategoryRecordDTO } from "@/types";
import { Money } from "./money";
import { ProductGrid } from "./product-grid";

export function ProductFilters({
  products,
  categories,
  locale,
  labels
}: {
  products: CatalogProductDTO[];
  categories: ProductCategoryRecordDTO[];
  locale: Locale;
  labels: {
    filters: string;
    all: string;
    category: string;
    size: string;
    color: string;
    price: string;
    noResults: string;
    noImage: string;
    outOfStock: string;
    order: string;
    details: string;
    search: string;
    searchPlaceholder: string;
  };
}) {
  const [category, setCategory] = useState("ALL");
  const [size, setSize] = useState("ALL");
  const [color, setColor] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const computedMaxPrice = useMemo(() => {
    if (products.length === 0) return 5000000;
    const prices = products.map((p) => productBasePrice(p));
    const maxVal = Math.max(...prices);
    return Math.max(5000000, maxVal);
  }, [products]);

  const currentMaxPrice = maxPrice ?? computedMaxPrice;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: products.length };
    products.forEach((p) => {
      if (p.categoryId) {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const sizes = [...new Set(products.flatMap((product) => productVariantSizes(product.variants)))];
  const colors = [...new Set(products.flatMap((product) => productVariantColors(product.variants, locale)))];
  const activeFilterCount = [
    category !== "ALL",
    size !== "ALL",
    color !== "ALL",
    maxPrice !== null && maxPrice < computedMaxPrice,
    searchQuery.trim() !== ""
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter(
      (product) =>
        product.stockStatus === "IN_STOCK" &&
        (category === "ALL" || product.categoryId === category) &&
        productMatchesVariantFilters(product.variants, { size, color }) &&
        productBasePrice(product) <= currentMaxPrice &&
        (query === "" ||
          product.nameVi.toLowerCase().includes(query) ||
          product.nameEn.toLowerCase().includes(query) ||
          product.slug.toLowerCase().includes(query))
    );
  }, [category, color, currentMaxPrice, products, size, searchQuery]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const activePage = Math.min(currentPage, Math.max(1, pageCount));

  const paginated = useMemo(
    () => {
      const start = (activePage - 1) * pageSize;
      return filtered.slice(start, start + pageSize);
    },
    [filtered, activePage, pageSize]
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function resetFilters() {
    setCategory("ALL");
    setSize("ALL");
    setColor("ALL");
    setMaxPrice(null);
    setSearchQuery("");
    setCurrentPage(1);
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr] lg:gap-10 xl:gap-12">
      {/* ── Search bar (full-width, above the grid) ── */}
      <div className="lg:col-span-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor="product-search" className="sr-only">
              {labels.search}
            </label>
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              id="product-search"
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={labels.searchPlaceholder}
              className="h-12 w-full border border-zinc-300 bg-white pl-11 pr-10 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:text-zinc-900"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mobile & Tablet Toggle Filter Button (Unified next to Search) */}
          <button
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
            type="button"
            className={cn(
              "flex lg:hidden h-12 px-4 items-center gap-2 border border-zinc-300 bg-white text-xs font-bold uppercase tracking-wider text-zinc-800 transition-all duration-200 hover:border-zinc-950",
              filtersOpen && "border-zinc-950 bg-zinc-50"
            )}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">{labels.filters}</span>
            {activeFilterCount > 0 && (
              <span className="grid size-4.5 place-items-center rounded-full bg-[#a72b1f] text-[9px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Category Navigation (full-width, below Search bar) ── */}
      <div className="lg:col-span-2 min-w-0">
        {/* Wrapping Flex pills (All visible, no horizontal scroll, extremely tidy) */}
        <div className="flex flex-wrap gap-2 border-b border-black/10 pb-5 mb-2">
          <button
            onClick={() => {
              setCategory("ALL");
              setCurrentPage(1);
            }}
            className={cn(
              "px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5",
              category === "ALL"
                ? "bg-[#11100e] border-[#11100e] text-white shadow-sm"
                : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-950 hover:bg-zinc-50"
            )}
          >
            <span>{labels.all}</span>
            <span className={cn(
              "text-[9px] px-1.5 py-0.2 font-bold rounded-full",
              category === "ALL" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
            )}>
              {categoryCounts["ALL"] || 0}
            </span>
          </button>
          {categories.map((item) => {
            const isSelected = category === item.id;
            const count = categoryCounts[item.id] || 0;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCategory(item.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5",
                  isSelected
                    ? "bg-[#11100e] border-[#11100e] text-white shadow-sm"
                    : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-950 hover:bg-zinc-50"
                )}
              >
                <span>{locale === "vi" ? item.nameVi : item.nameEn}</span>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 font-bold rounded-full",
                  isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="min-w-0">


        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out lg:block",
            filtersOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none lg:pointer-events-auto lg:opacity-100"
          )}
        >
          <div className="overflow-hidden border-b border-black/15 lg:border-0">
            <div className="hidden items-center gap-2 border-b border-black pb-4 lg:flex">
              <SlidersHorizontal size={16} className="translate-y-[-0.5px]" />
              <p className="eyebrow">{labels.filters}</p>
            </div>
          <div className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6 lg:py-6">
            <FilterSelect
              allLabel={labels.all}
              label={labels.size}
              onChange={(value) => {
                setSize(value);
                setCurrentPage(1);
              }}
              options={sizes.map((item) => ({ value: item, label: item }))}
              value={size}
            />
            <FilterSelect
              allLabel={labels.all}
              label={labels.color}
              onChange={(value) => {
                setColor(value);
                setCurrentPage(1);
              }}
              options={colors.map((item) => ({ value: item, label: item }))}
              value={color}
            />
            <div className="relative block w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="label !mb-0">{labels.price}</span>
                <span className="text-[10px] font-black text-[#a72b1f] bg-[#a72b1f]/5 px-2 py-0.5 border border-[#a72b1f]/10 rounded-sm">
                  ≤ <Money amountVnd={currentMaxPrice} />
                </span>
              </div>
              <div className="flex min-h-12 w-full items-center border border-zinc-300 bg-white px-4 py-2">
                <div className="w-full flex items-center gap-3">
                  <span className="text-[9px] font-bold text-zinc-400">500k</span>
                  <input
                    className="w-full h-1 bg-zinc-200 rounded appearance-none cursor-pointer accent-[#a72b1f]"
                    max={computedMaxPrice}
                    min="500000"
                    onChange={(event) => {
                      setMaxPrice(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    step="100000"
                    type="range"
                    value={currentMaxPrice}
                  />
                  <span className="text-[9px] font-bold text-zinc-400 whitespace-nowrap">
                    {Math.round(computedMaxPrice / 1000000)}M+
                  </span>
                </div>
              </div>
            </div>
          </div>
          {activeFilterCount > 0 ? (
            <button
              className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#a72b1f] lg:mb-0"
              onClick={resetFilters}
              type="button"
            >
              <X size={14} className="translate-y-[-0.5px]" />
              {labels.all}
            </button>
          ) : null}
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        {paginated.length ? (
          <>
            <ProductGrid
              detailsLabel={labels.details}
              locale={locale}
              noImageLabel={labels.noImage}
              orderLabel={labels.order}
              outOfStockLabel={labels.outOfStock}
              products={paginated}
            />
            {pageCount > 1 ? (
              <div className="mt-16 flex flex-col gap-6 border-t border-black/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-xs font-bold uppercase tracking-wider text-zinc-500 sm:text-left">
                  {locale === "vi"
                    ? `Hiển thị ${(activePage - 1) * pageSize + 1}–${Math.min(activePage * pageSize, filtered.length)} trên tổng số ${filtered.length} sản phẩm`
                    : `Showing ${(activePage - 1) * pageSize + 1}–${Math.min(activePage * pageSize, filtered.length)} of ${filtered.length} products`}
                </p>
                <Pagination
                  currentPage={activePage}
                  totalPages={pageCount}
                  onPageChange={handlePageChange}
                  locale={locale}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="border border-dashed border-zinc-400 p-12 text-center text-sm text-zinc-600">
            {labels.noResults}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  allLabel,
  options,
  onChange
}: {
  label: string;
  value: string;
  allLabel: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    value === "ALL"
      ? { value: "ALL", label: allLabel }
      : options.find((opt) => opt.value === value) || {
          value: "ALL",
          label: allLabel
        };

  return (
    <div className="relative block w-full" ref={containerRef}>
      <span className="label mb-2 block">{label}</span>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex min-h-12 w-full items-center justify-between border bg-white px-3.5 py-3 text-left text-sm text-[#0a0a0a] outline-none transition-all duration-200",
          isOpen
            ? "border-zinc-950 ring-1 ring-zinc-950"
            : "border-zinc-300 hover:border-zinc-400"
        )}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="font-semibold truncate">{selectedOption.label}</span>
        <ChevronDown
          className={cn(
            "size-4 text-zinc-500 transition-transform duration-300 ease-out",
            isOpen ? "rotate-180 text-zinc-950" : ""
          )}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <div
        className={cn(
          "absolute left-0 right-0 z-30 mt-1 border border-zinc-200 bg-white shadow-xl transition-all duration-200 origin-top",
          isOpen
            ? "visible scale-y-100 opacity-100 translate-y-0"
            : "invisible scale-y-95 opacity-0 -translate-y-1 pointer-events-none"
        )}
      >
        <ul className="max-h-60 overflow-y-auto py-1 text-xs uppercase tracking-wider font-bold" role="listbox">
          <li key="ALL" role="option" aria-selected={value === "ALL"}>
            <button
              className={cn(
                "flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors",
                value === "ALL"
                  ? "bg-zinc-100 text-zinc-950 font-black"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              )}
              onClick={() => {
                onChange("ALL");
                setIsOpen(false);
              }}
              type="button"
            >
              <span>{allLabel}</span>
              {value === "ALL" ? <Check size={14} className="text-zinc-950" /> : null}
            </button>
          </li>
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors",
                    isSelected
                      ? "bg-zinc-100 text-zinc-950 font-black"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? <Check size={14} className="text-zinc-950" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
