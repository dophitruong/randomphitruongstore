import type { Locale } from "@/i18n/request";
import type { ProductWithImages } from "@/types";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  locale,
  orderLabel,
  detailsLabel
}: {
  products: ProductWithImages[];
  locale: Locale;
  orderLabel: string;
  detailsLabel: string;
}) {
  return (
    <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          detailsLabel={detailsLabel}
          key={product.id}
          locale={locale}
          orderLabel={orderLabel}
          product={product}
        />
      ))}
    </div>
  );
}
