"use client";


import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BRAND_NAME,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CartCount } from "./cart-count";
import { CurrencySelector } from "./currency-selector";
import { LanguageToggle } from "./language-toggle";
import { UserMenu } from "./user-menu";

export function Header() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const shopLink = { href: "/shop", label: t("shop") };
  const links = [
    { href: "/order-request", label: t("orderRequest") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#11100e]/95 text-white backdrop-blur-md">
      <div className="container-shell flex h-[4.5rem] items-center justify-between gap-2 sm:gap-4">
        <Link
          className="group flex min-w-0 items-center gap-2 sm:gap-3"
          href="/"
        >
          <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-white sm:size-10">
            <Image
              alt={`${BRAND_NAME} logo`}
              className="object-contain"
              fill
              priority
              sizes="40px"
              src="/truongphistore/android-chrome-192x192.png"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-black tracking-[-0.03em] sm:text-base">
              {BRAND_NAME}
            </span>
            <span className="hidden text-[0.5rem] font-bold uppercase tracking-[0.28em] text-white/45 sm:block">
              Sukajan order studio
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {[shopLink, ...links].map((link) => (
            <Link
              className={cn(
                "relative py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/60 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-[#d64b3d] after:transition-transform hover:text-white hover:after:scale-x-100",
                pathname === link.href && "text-white after:scale-x-100"
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Desktop only: currency, language */}
          <div className="hidden lg:block">
            <CurrencySelector />
          </div>
          <div className="hidden lg:block">
            <LanguageToggle />
          </div>
          {/* Cart & user visible on desktop only — mobile uses bottom nav */}
          <div className="hidden lg:block">
            <CartCount />
          </div>
          <div className="hidden lg:block">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
