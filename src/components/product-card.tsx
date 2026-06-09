import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/request";
import { categoryLabel, formatPrice } from "@/lib/format";
import type { ProductWithImages } from "@/types";
import { OrderBadge } from "./order-badge";

export function ProductCard({
  product,
  locale,
  orderLabel,
  detailsLabel
}: {
  product: ProductWithImages;
  locale: Locale;
  orderLabel: string;
  detailsLabel: string;
}) {
  const image = product.images[0];
  const name = locale === "vi" ? product.nameVi : product.nameEn;

  return (
    <article className="group">
      <Link className="block" href={`/shop/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-200">
          {image ? (
            <Image
              alt={locale === "vi" ? image.altVi : image.altEn}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={image.url}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-zinc-500">
              No image
            </div>
          )}
          <div className="absolute left-3 top-3">
            <OrderBadge label={orderLabel} />
          </div>
        </div>
        <div className="pt-4">
          <p className="eyebrow text-zinc-500">
            {categoryLabel(product.category, locale)}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h3 className="font-bold leading-tight">{name}</h3>
            <p className="shrink-0 text-sm font-bold">
              {formatPrice(product.price, locale)}
            </p>
          </div>
          <span className="mt-3 inline-block border-b border-black pb-0.5 text-xs font-bold uppercase tracking-[0.08em]">
            {detailsLabel}
          </span>
        </div>
      </Link>
    </article>
  );
}
