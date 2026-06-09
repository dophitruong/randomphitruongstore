"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/request";
import { categoryLabel } from "@/lib/format";
import type { ProductWithImages } from "@/types";
import { ProductGrid } from "./product-grid";

const categories = ["SUKAJAN", "BOMBER", "HOODIE", "JACKET", "SEASONAL"];

export function ProductFilters({
  products,
  locale,
  labels
}: {
  products: ProductWithImages[];
  locale: Locale;
  labels: {
    filters: string;
    all: string;
    category: string;
    size: string;
    color: string;
    price: string;
    noResults: string;
    order: string;
    details: string;
  };
}) {
  const [category, setCategory] = useState("ALL");
  const [size, setSize] = useState("ALL");
  const [color, setColor] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState(5000000);
  const sizes = [...new Set(products.flatMap((product) => product.sizes))];
  const colors = [...new Set(products.flatMap((product) => product.colors))];

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "ALL" || product.category === category) &&
          (size === "ALL" || product.sizes.includes(size)) &&
          (color === "ALL" || product.colors.includes(color)) &&
          product.price <= maxPrice
      ),
    [category, color, maxPrice, products, size]
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside>
        <div className="flex items-center gap-2 border-b border-black pb-4">
          <SlidersHorizontal size={16} />
          <p className="eyebrow">{labels.filters}</p>
        </div>
        <div className="space-y-6 py-6">
          <FilterSelect
            label={labels.category}
            onChange={setCategory}
            options={categories.map((item) => ({
              value: item,
              label: categoryLabel(item, locale)
            }))}
            value={category}
            allLabel={labels.all}
          />
          <FilterSelect
            label={labels.size}
            onChange={setSize}
            options={sizes.map((item) => ({ value: item, label: item }))}
            value={size}
            allLabel={labels.all}
          />
          <FilterSelect
            label={labels.color}
            onChange={setColor}
            options={colors.map((item) => ({ value: item, label: item }))}
            value={color}
            allLabel={labels.all}
          />
          <label className="block">
            <span className="label">{labels.price}</span>
            <input
              className="w-full accent-black"
              max="5000000"
              min="500000"
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              step="100000"
              type="range"
              value={maxPrice}
            />
            <span className="mt-2 block text-xs font-bold">
              ≤ {new Intl.NumberFormat("vi-VN").format(maxPrice)} VND
            </span>
          </label>
        </div>
      </aside>

      <section>
        {filtered.length ? (
          <ProductGrid
            detailsLabel={labels.details}
            locale={locale}
            orderLabel={labels.order}
            products={filtered}
          />
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
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select
        className="field"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="ALL">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
