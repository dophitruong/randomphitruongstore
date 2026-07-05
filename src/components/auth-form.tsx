"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Script from "next/script";
import { useAuth } from "@/context/auth-context";
import { registerInputSchema, loginInputSchema } from "@/lib/validations";

interface TurnstileWindow {
  turnstile?: {
    render: (
      container: string | HTMLElement,
      options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
      }
    ) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
  };
}

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);

  const schema = mode === "register" ? registerInputSchema : loginInputSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<Values>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let checkInterval: NodeJS.Timeout;
    
    const initTurnstile = () => {
      const tsWindow = window as unknown as TurnstileWindow;
      if (typeof window !== "undefined" && tsWindow.turnstile) {
        clearInterval(checkInterval);
        if (widgetId === null) {
          try {
            const id = tsWindow.turnstile.render("#turnstile-container", {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
              callback: (token: string) => {
                setCaptchaToken(token);
              },
              "expired-callback": () => {
                setCaptchaToken(null);
              },
              "error-callback": () => {
                setCaptchaToken(null);
              }
            });
            setWidgetId(id);
          } catch (e) {
            console.error("Turnstile render error:", e);
          }
        }
      }
    };

    checkInterval = setInterval(initTurnstile, 200);

    return () => {
      clearInterval(checkInterval);
      const tsWindow = window as unknown as TurnstileWindow;
      if (widgetId !== null && typeof window !== "undefined" && tsWindow.turnstile) {
        try {
          tsWindow.turnstile.remove(widgetId);
        } catch {}
        setWidgetId(null);
      }
    };
  }, [mode, widgetId]);

  async function submit(values: Values) {
    setServerError(null);

    if (!captchaToken) {
      setServerError("Vui lòng xác minh CAPTCHA để tiếp tục / Please complete the CAPTCHA to proceed.");
      return;
    }

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        captchaToken,
        ...(mode === "register" && { fullName: values.fullName })
      })
    });

    const json = await res.json();

    if (!json.success) {
      setServerError(json.error ?? "Something went wrong");
      // Reset Turnstile on error
      const tsWindow = window as unknown as TurnstileWindow;
      if (widgetId !== null && typeof window !== "undefined" && tsWindow.turnstile) {
        tsWindow.turnstile.reset(widgetId);
        setCaptchaToken(null);
      }
      return;
    }

    await refreshUser();
    router.replace("/account");
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
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

        <div className="flex justify-center my-2">
          <div id="turnstile-container"></div>
        </div>

        <button className="button-primary" disabled={isSubmitting} type="submit">
          {mode === "login" ? labels.loginAction : labels.registerAction}
          <ArrowRight size={16} />
        </button>
      </form>
    </>
  );
}
