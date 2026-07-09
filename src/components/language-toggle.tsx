"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleLocale() {
    const nextLocale = locale === "vi" ? "en" : "vi";
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
    <button
      aria-label={t("language")}
      disabled={isPending}
      onClick={toggleLocale}
      type="button"
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all border-0 bg-transparent cursor-pointer outline-none",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      <FontAwesomeIcon icon={faGlobe} className="text-[12px] text-zinc-400" />
      <span>{locale}</span>
    </button>
  );
}
