import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false }
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black p-5 text-white">
      <section className="w-full max-w-md border border-white/20 bg-zinc-950 p-7 sm:p-10">
        <p className="eyebrow text-white/40">Protected workspace</p>
        <h1 className="mt-4 text-4xl font-black">Admin sign in</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Temporary password authentication. Configure ADMIN_PASSWORD and
          ADMIN_SESSION_SECRET before use.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
