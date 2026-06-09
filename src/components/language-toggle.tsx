"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateLocale(nextLocale: "vi" | "en") {
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale })
      });
      router.refresh();
    });
  }

  return (
    <div
      aria-label={t("language")}
      className={cn(
        "flex items-center border border-white/30 text-[11px] font-bold",
        isPending && "opacity-60"
      )}
    >
      {(["vi", "en"] as const).map((item) => (
        <button
          className={cn(
            "px-2 py-1.5 uppercase",
            locale === item ? "bg-white text-black" : "text-white"
          )}
          disabled={isPending}
          key={item}
          onClick={() => updateLocale(item)}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
