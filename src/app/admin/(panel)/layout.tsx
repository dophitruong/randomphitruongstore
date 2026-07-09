import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createPerfContext, withPerfTiming } from "@/lib/perf-diagnostics";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true
    }
  }
};

export default async function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const perf = createPerfContext("admin.layout");
  const authenticated = await withPerfTiming(
    perf,
    "admin.session.validate",
    () => isAdminAuthenticated()
  );

  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell min-h-screen w-full max-w-full bg-[#f3f2ef] text-zinc-950">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-7 sm:pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:p-10 lg:pb-10">{children}</main>
    </div>
  );
}
