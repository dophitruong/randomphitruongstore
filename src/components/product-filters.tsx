"use client";

import { ChevronDown, SlidersHorizontal, X, Check } from "lucide-react";
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
  };
}) {
  const [category, setCategory] = useState("ALL");
  const [size, setSize] = useState("ALL");
  const [color, setColor] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
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
  const sizes = [...new Set(products.flatMap((product) => productVariantSizes(product.variants)))];
  const colors = [...new Set(products.flatMap((product) => productVariantColors(product.variants, locale)))];
  const activeFilterCount = [
    category !== "ALL",
    size !== "ALL",
    color !== "ALL",
    maxPrice !== null && maxPrice < computedMaxPrice
  ].filter(Boolean).length;

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          product.stockStatus === "IN_STOCK" &&
          (category === "ALL" || product.categoryId === category) &&
          productMatchesVariantFilters(product.variants, { size, color }) &&
          productBasePrice(product) <= currentMaxPrice
      ),
    [category, color, currentMaxPrice, products, size]
  );

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
    setCurrentPage(1);
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr] lg:gap-10 xl:gap-12">
      <aside className="min-w-0">
        <button
          aria-expanded={filtersOpen}
          className="flex min-h-12 w-full items-center justify-between border-y border-black px-1 text-left lg:hidden"
          onClick={() => setFiltersOpen((open) => !open)}
          type="button"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="translate-y-[-0.5px]" />
            <span className="text-xs font-black uppercase tracking-[0.14em]">
              {labels.filters}
            </span>
            {activeFilterCount > 0 ? (
              <span className="grid size-5 place-items-center rounded-full bg-[#a72b1f] text-[10px] font-black text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </span>
          <ChevronDown
            className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            size={18}
          />
        </button>

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
              label={labels.category}
              onChange={(value) => {
                setCategory(value);
                setCurrentPage(1);
              }}
              options={categories.map((item) => ({
                value: item.id,
                label: locale === "vi" ? item.nameVi : item.nameEn
              }))}
              value={category}
            />
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
            <label className="block">
              <span className="label">{labels.price}</span>
              <input
                className="w-full accent-black"
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
              <span className="mt-2 block text-xs font-bold">
                ≤ <Money amountVnd={currentMaxPrice} />
              </span>
            </label>
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
