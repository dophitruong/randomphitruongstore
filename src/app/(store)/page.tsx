import type { Metadata } from "next";
import { ArrowRight, Instagram, Music2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ProductGrid } from "@/components/product-grid";
import type { Locale } from "@/i18n/request";
import {
  INSTAGRAM_URL,
  TIKTOK_URL
} from "@/lib/constants";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium streetwear order",
  description:
    "Shop curated Sukajan, bomber jackets, hoodies and seasonal streetwear with 7-10 day delivery."
};

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home");
  const common = await getTranslations("common");
  const featured = await getPrisma().product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { updatedAt: "desc" },
    take: 6
  });

  return (
    <>
      <section className="relative min-h-[78svh] overflow-hidden bg-black text-white">
        <Image
          alt="Premium streetwear editorial"
          className="object-cover opacity-65"
          fill
          priority
          sizes="100vw"
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="container-shell relative flex min-h-[78svh] items-end py-14 sm:items-center">
          <div className="max-w-3xl">
            <p className="eyebrow text-white/60">{t("eyebrow")}</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              {t("subtitle")}
            </p>
            <Link
              className="button-primary mt-8 border-white bg-white text-black hover:border-zinc-200 hover:bg-zinc-200"
              href="/shop"
            >
              {common("viewShop")}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-8 py-20 md:grid-cols-2 md:py-28">
        <p className="eyebrow text-zinc-500">{t("introTitle")}</p>
        <p className="max-w-2xl text-2xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
          {t("introBody")}
        </p>
      </section>

      <section className="container-shell pb-20 md:pb-28">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-black tracking-[-0.03em] sm:text-5xl">
            {t("featured")}
          </h2>
          <Link className="hidden text-xs font-bold uppercase sm:block" href="/shop">
            {common("shop")} →
          </Link>
        </div>
        <ProductGrid
          detailsLabel={common("viewDetails")}
          locale={locale}
          orderLabel={common("orderTime")}
          products={featured}
        />
      </section>

      <section className="bg-black py-16 text-white md:py-20">
        <div className="container-shell grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
          <h2 className="text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">
            {t("processTitle")}
          </h2>
          <p className="text-sm leading-6 text-white/60">{t("processBody")}</p>
        </div>
      </section>

      <section className="container-shell grid gap-10 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <p className="eyebrow text-zinc-500">Social diary</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            {t("socialTitle")}
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-600">
            {t("socialBody")}
          </p>
        </div>
        <div className="grid gap-3">
          <a
            className="flex items-center justify-between border border-black p-5 font-bold hover:bg-black hover:text-white"
            href={INSTAGRAM_URL}
            rel="noreferrer"
            target="_blank"
          >
            <span className="flex items-center gap-3">
              <Instagram /> Instagram
            </span>
            @random.phitruong4
          </a>
          <a
            className="flex items-center justify-between border border-black p-5 font-bold hover:bg-black hover:text-white"
            href={TIKTOK_URL}
            rel="noreferrer"
            target="_blank"
          >
            <span className="flex items-center gap-3">
              <Music2 /> TikTok
            </span>
            @random.phitruong
          </a>
        </div>
      </section>
    </>
  );
}
