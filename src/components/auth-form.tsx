"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/auth-context";
import { registerInputSchema, loginInputSchema } from "@/lib/validations";

type Values = {
  fullName?: string;
  email: string;
  password: string;
  rememberMe?: boolean;
};

export function AuthForm({
  mode,
  labels
}: {
  mode: "login" | "register";
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredEmailNotice, setRegisteredEmailNotice] = useState<string | null>(null);

  const schema = mode === "register" ? registerInputSchema : loginInputSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<Values>({
    resolver: zodResolver(schema)
  });

  async function submit(values: Values) {
    setServerError(null);
    setRegisteredEmailNotice(null);

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        ...(mode === "register" && { fullName: values.fullName })
      })
    });

    const json = await res.json();

    if (!json.success) {
      setServerError(json.error ?? "Something went wrong");
      return;
    }

    if (mode === "register" && json.data?.requiresEmailConfirmation) {
      setRegisteredEmailNotice(
        json.data.message ||
          "Đăng ký thành công! Vui lòng kiểm tra hộp thư email (kể cả mục Spam) để kích hoạt tài khoản trước khi đăng nhập."
      );
      return;
    }

    await refreshUser();
    router.replace("/account");
  }

  if (registeredEmailNotice) {
    return (
      <div className="mt-8 border border-emerald-300 bg-emerald-50/70 p-6 shadow-[8px_8px_0_rgba(17,16,14,0.08)] sm:p-8 space-y-4">
        <div className="flex items-center gap-3 text-emerald-800">
          <MailCheck size={28} className="shrink-0 text-emerald-600" />
          <h2 className="text-lg font-black tracking-tight">Đăng ký tài khoản thành công!</h2>
        </div>
        <p className="text-sm leading-relaxed text-zinc-700">
          {registeredEmailNotice}
        </p>
        <div className="pt-2">
          <Link
            className="button-primary inline-flex items-center gap-2"
            href="/login"
          >
            Đến trang Đăng nhập
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="mt-8 grid gap-5 border border-black/15 bg-white p-5 shadow-[8px_8px_0_rgba(17,16,14,0.08)] sm:p-8"
      onSubmit={handleSubmit(submit)}
    >
      {serverError ? (
        <p className="error-text">{serverError}</p>
      ) : null}
      {mode === "register" ? (
        <label>
          <span className="label">{labels.fullName}</span>
          <input className="field" autoComplete="name" {...register("fullName")} />
        </label>
      ) : null}
      <label>
        <span className="label">{labels.email}</span>
        <input
          className="field"
          autoComplete="email"
          type="email"
          {...register("email")}
        />
        {errors.email ? <span className="error-text">{errors.email.message ?? labels.invalidEmail}</span> : null}
      </label>
      <label>
        <span className="label">{labels.password}</span>
        <input
          className="field"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          type="password"
          {...register("password")}
        />
        {errors.password ? (
          <span className="error-text">{errors.password.message ?? labels.passwordHint}</span>
        ) : null}
      </label>
      {mode === "login" && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="mt-1 accent-black size-4"
            {...register("rememberMe")}
          />
          <span className="text-sm text-zinc-600">{labels.rememberMe}</span>
        </label>
      )}

      <button className="button-primary" disabled={isSubmitting} type="submit">
        {mode === "login" ? labels.loginAction : labels.registerAction}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}

