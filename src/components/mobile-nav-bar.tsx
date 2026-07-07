"use client";

import {
  ArrowRight,
  Globe,
  LayoutGrid,
  LogOut,
  Send,
  ShoppingBag,
  ShoppingCart,
  User,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";
import { useAuth } from "@/context/auth-context";
import { CurrencySelector } from "./currency-selector";
import { LanguageToggle } from "./language-toggle";
import { cn } from "@/lib/utils";

export function MobileNavBar() {
  const pathname = usePathname();
  const common = useTranslations("common");
  const { count, hydrated } = useCart();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close slide-up panel whenever route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const tabs = [
    {
      href: "/shop",
      label: common("shop"),
      icon: ShoppingBag
    },
    {
      href: "/order-request",
      label: common("orderRequest"),
      icon: Send
    },
    {
      href: "/cart",
      label: common("cart"),
      icon: ShoppingCart,
      badge: hydrated && count > 0 ? count : null
    }
  ];

  const menuLinks = [
    { href: "/about", label: common("about") },
    { href: "/contact", label: common("contact") }
  ];

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    common("account");

  return (
    <>
      {/* ── Fixed bottom nav bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Mobile navigation"
      >
        <div className="flex h-16 items-stretch border-t border-white/10 bg-[#11100e]">
          {/* Regular tabs */}
          {tabs.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                  isActive ? "text-white" : "text-white/45 hover:text-white/75"
                )}
              >
                <span className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {badge !== null && badge !== undefined ? (
                    <span className="absolute -right-2 -top-1 grid min-w-4 place-items-center rounded-full bg-[#a72b1f] px-0.5 text-[9px] font-black text-white">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] leading-none">
                  {label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 h-0.5 w-6 -translate-x-1/2 bg-[#d64b3d]" />
                )}
              </Link>
            );
          })}

          {/* Menu tab */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
              menuOpen ? "text-white" : "text-white/45 hover:text-white/75"
            )}
            aria-expanded={menuOpen}
            aria-label="Menu"
          >
            <LayoutGrid size={20} strokeWidth={menuOpen ? 2.2 : 1.8} />
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] leading-none">
              Menu
            </span>
            {menuOpen && (
              <span className="absolute top-0 left-1/2 h-0.5 w-6 -translate-x-1/2 bg-[#d64b3d]" />
            )}
          </button>
        </div>
      </nav>

      {/* ── Slide-up menu panel ── */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-[#11100e] text-white transition-transform duration-300 ease-out lg:hidden rounded-t-2xl",
          menuOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)" }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">
            Menu
          </p>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="grid size-8 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* User section */}
        <div className="border-b border-white/10 px-5 py-3">
          {user ? (
            <div className="flex flex-col gap-1">
              {/* Profile row — full-width tap target */}
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/8 active:bg-white/10"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
                  <User size={18} className="text-white/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold leading-tight">{displayName}</p>
                  <p className="truncate text-xs text-white/50">{user.email}</p>
                </div>
                <ArrowRight size={15} className="shrink-0 text-white/30" />
              </Link>

              {/* Logout row — separate, clearly labelled */}
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  await signOut();
                }}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/8 active:bg-white/10"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.06]">
                  <LogOut size={16} className="text-white/40" />
                </div>
                <span className="text-sm font-semibold text-white/50">{common("logout")}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 py-0.5"
              onClick={() => setMenuOpen(false)}
            >
              <div className="grid size-9 place-items-center rounded-full bg-white/10">
                <User size={16} className="text-white/70" />
              </div>
              <span className="text-sm font-bold">{common("login")}</span>
              <ArrowRight size={14} className="ml-auto text-white/40" />
            </Link>
          )}
        </div>

        {/* Nav links */}
        <nav className="px-5 py-3">
          {menuLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between border-b border-white/5 py-3.5 text-sm font-bold last:border-0 transition-colors",
                  isActive ? "text-[#d64b3d]" : "text-white/75 hover:text-white"
                )}
              >
                <span>{link.label}</span>
                {isActive ? (
                  <span className="size-1.5 rounded-full bg-[#d64b3d]" />
                ) : (
                  <ArrowRight size={14} className="text-white/30" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language & Currency */}
        <div className="flex items-center gap-4 border-t border-white/10 px-5 py-4">
          <Globe size={14} className="shrink-0 text-white/40" />
          <CurrencySelector />
          <LanguageToggle />
        </div>
      </div>
    </>
  );
}
