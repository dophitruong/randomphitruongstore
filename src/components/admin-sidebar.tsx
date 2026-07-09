"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faShirt,
  faBoxesStacked,
  faClipboardList,
  faGear,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Tổng quan", shortLabel: "T.quan", icon: faGauge },
  { href: "/admin/products", label: "Sản phẩm", shortLabel: "S.phẩm", icon: faShirt },
  { href: "/admin/orders", label: "Đơn hàng", shortLabel: "Đ.hàng", icon: faBoxesStacked },
  { href: "/admin/order-requests", label: "Yêu cầu", shortLabel: "Y.cầu", icon: faClipboardList },
  { href: "/admin/settings", label: "Cài đặt", shortLabel: "C.đặt", icon: faGear }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile Top Bar Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between bg-[#171715] px-4 text-white lg:hidden">
        <Link className="text-base font-black tracking-tight" href="/">
          random.phitruong
        </Link>
        <button
          onClick={logout}
          type="button"
          className="flex items-center gap-1 px-2 py-1 border border-white/10 rounded text-[9px] font-bold uppercase tracking-wider hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
          aria-label="Đăng xuất"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="text-[10px]" />
          <span>Đăng xuất</span>
        </button>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-[#171715] flex items-center justify-around px-2 text-white lg:hidden shadow-lg">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-white/60 transition-colors cursor-pointer",
                active && "text-[#bd3a2d]"
              )}
              href={link.href}
            >
              <div className={cn(
                "size-8 rounded-full flex items-center justify-center transition-all duration-200",
                active ? "border border-[#bd3a2d] bg-[#a72b1f]/10 text-[#bd3a2d]" : "text-white/50"
              )}>
                <FontAwesomeIcon icon={link.icon} className="text-[13px]" />
              </div>
              <span className={cn("text-[9px] font-bold uppercase tracking-wider mt-1 font-mono", active && "text-white")}>
                {link.shortLabel}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar (lg Screen and Up) */}
      <aside className="hidden border-r border-white/10 bg-[#171715] p-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:justify-between shrink-0">
        <div>
          <Link className="block px-3 py-3 text-xl font-black tracking-tight" href="/">
            random.phitruong
          </Link>
          <p className="mb-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Không gian quản trị
          </p>
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/admin" && pathname.startsWith(link.href));
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
                  <FontAwesomeIcon icon={link.icon} className="text-[14px] shrink-0 w-4 text-center" />
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
            <FontAwesomeIcon icon={faRightFromBracket} className="text-[14px] shrink-0 w-4 text-center" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
