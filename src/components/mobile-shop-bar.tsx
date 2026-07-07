"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * Sticky bottom bar shown on mobile/tablet only (lg:hidden).
 * Hidden when already on the /shop page.
 */
export function MobileShopBar() {
  const pathname = usePathname();
  const common = useTranslations("common");

  // Hide on the shop page itself (any locale variant, e.g. /vi/shop, /en/shop, /shop)
  const isShopPage = /\/shop(\/|$)/.test(pathname);
  if (isShopPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Subtle top shadow to lift bar above page content */}
      <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-black/20 to-transparent" />
      <Link
        href="/shop"
        className="flex h-14 w-full items-center justify-center gap-2.5 bg-[#a72b1f] text-white transition-colors active:bg-[#8b2218]"
      >
        <ShoppingBag size={18} strokeWidth={2} />
        <span className="text-sm font-black uppercase tracking-[0.12em]">
          {common("viewShop")}
        </span>
        <ArrowRight size={16} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
