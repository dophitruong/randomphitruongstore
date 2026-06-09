"use client";

import { Instagram, Menu, Music2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BRAND_NAME,
  INSTAGRAM_URL,
  TIKTOK_URL
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-toggle";

export function Header() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/shop", label: t("shop") },
    { href: "/order-request", label: t("orderRequest") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/15 bg-black text-white">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link
          className="text-sm font-black tracking-[-0.03em] sm:text-base"
          href="/"
          onClick={() => setOpen(false)}
        >
          {BRAND_NAME}
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              className={cn(
                "text-xs font-bold uppercase tracking-[0.12em] text-white/65 hover:text-white",
                pathname === link.href && "text-white"
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            aria-label="Instagram"
            className="hidden p-2 text-white/70 hover:text-white sm:block"
            href={INSTAGRAM_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Instagram size={18} />
          </a>
          <a
            aria-label="TikTok"
            className="hidden p-2 text-white/70 hover:text-white sm:block"
            href={TIKTOK_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Music2 size={18} />
          </a>
          <LanguageToggle />
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            className="p-2 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="container-shell border-t border-white/15 py-5 lg:hidden">
          {links.map((link) => (
            <Link
              className="block border-b border-white/10 py-4 text-sm font-bold uppercase tracking-[0.1em]"
              href={link.href}
              key={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
