import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "random.phitruong admin",
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

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#11100e] p-5 text-white">
      <section className="w-full max-w-md border border-white/15 bg-[#191816] p-7 shadow-2xl sm:p-10">
        <p className="eyebrow text-white/40">Protected workspace</p>
        <h1 className="mt-4 text-4xl font-black">random.phitruong admin</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Internal access for authorized store staff only.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
