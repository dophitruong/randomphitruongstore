"use client";

import { ClipboardList, LayoutDashboard, LogOut, Package, Settings, Shirt, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Shirt },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/order-requests", label: "Order requests", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile Top Bar Header */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-white/10 bg-[#171715] px-4 text-white lg:hidden">
        <Link className="text-base font-black tracking-tight" href="/">
          random.phitruong
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="grid size-9 place-items-center border border-white/10 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={18} className="translate-y-[-0.5px]" />
          ) : (
            <svg
              className="size-4.5 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div className="fixed inset-x-0 top-14 z-40 border-b border-white/10 bg-[#171715] p-4 text-white shadow-xl animate-in fade-in-0 slide-in-from-top-2 duration-200 lg:hidden">
          <nav className="grid gap-2">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/admin" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white",
                    active &&
                      "border-[#bd3a2d] bg-[#a72b1f] text-white hover:bg-[#8f241a]"
                  )}
                  href={link.href}
                  key={link.href}
                >
                  <Icon size={16} className="translate-y-[-0.5px]" />
                  {link.label}
                </Link>
              );
            })}
            <button
              className="mt-4 flex min-h-11 w-full items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/50 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white cursor-pointer"
              onClick={logout}
              type="button"
            >
              <LogOut size={16} className="translate-y-[-0.5px]" />
              Sign out
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar (lg Screen and Up) */}
      <aside className="hidden border-r border-white/10 bg-[#171715] p-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:justify-between shrink-0">
        <div>
          <Link className="block px-3 py-3 text-xl font-black tracking-tight" href="/">
            random.phitruong
          </Link>
          <p className="mb-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Admin workspace
          </p>
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/admin" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  className={cn(
                    "flex min-h-11 items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/65 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white",
                    active &&
                      "border-[#bd3a2d] bg-[#a72b1f] text-white hover:border-[#bd3a2d] hover:bg-[#8f241a] hover:text-white"
                  )}
                  href={link.href}
                  key={link.href}
                >
                  <Icon size={16} className="translate-y-[-0.5px]" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div>
          <button
            className="mt-6 flex min-h-11 w-full items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white/50 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white cursor-pointer"
            onClick={logout}
            type="button"
          >
            <LogOut size={16} className="translate-y-[-0.5px]" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
