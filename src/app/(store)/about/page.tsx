import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "About",
  description: "The story and ordering promise behind random.phitruong."
};

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div>
      <section className="container-shell grid gap-10 py-12 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow text-zinc-500">Since 2024 / Vietnam</p>
          <h1 className="mt-4 text-5xl font-black leading-[0.98] tracking-[-0.05em] sm:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-600">
            {t("body")}
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-200">
          <Image
            alt="Streetwear detail"
            className="object-cover grayscale"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=85"
          />
        </div>
      </section>
      <section className="bg-black py-16 text-white sm:py-24">
        <div className="container-shell grid gap-6 md:grid-cols-2">
          <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            {t("promiseTitle")}
          </h2>
          <p className="max-w-xl text-sm leading-7 text-white/60">
            {t("promiseBody")}
          </p>
        </div>
      </section>
    </div>
  );
}
