"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  hasPaymentDestination,
  navigateToPayment,
  type PaymentCheckoutData
} from "@/lib/payment-navigation";

export const SEPAY_REDIRECT_DELAY_SECONDS = 5;

type SePayRedirectLabels = {
  title: string;
  body: string;
  warning: string;
  countdown: string;
  preparing: string;
  action: string;
  redirecting: string;
  unavailable: string;
};

export function SePayRedirectNotice({
  paymentData,
  labels,
  error
}: {
  paymentData: PaymentCheckoutData | null;
  labels: SePayRedirectLabels;
  error?: string;
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    SEPAY_REDIRECT_DELAY_SECONDS
  );
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [navigationError, setNavigationError] = useState(false);
  const hasNavigatedRef = useRef(false);
  const hasDestination = hasPaymentDestination(paymentData);

  const continueToPayment = useCallback(() => {
    if (!hasPaymentDestination(paymentData) || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    setIsRedirecting(true);
    setNavigationError(false);

    if (!navigateToPayment(paymentData)) {
      hasNavigatedRef.current = false;
      setIsRedirecting(false);
      setNavigationError(true);
    }
  }, [paymentData]);

  useEffect(() => {
    hasNavigatedRef.current = false;

    if (!hasDestination) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          continueToPayment();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [continueToPayment, hasDestination]);

  const statusText = hasDestination
    ? labels.countdown.replace("{seconds}", String(remainingSeconds))
    : labels.preparing;
  const visibleError = error || (navigationError ? labels.unavailable : "");

  return (
    <div
      aria-live="polite"
      className="mt-8 border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"
      role="status"
    >
      <div className="flex items-start gap-3">
        <Loader2 className="mt-1 size-5 shrink-0 animate-spin text-amber-700" />
        <div className="min-w-0">
          <p className="font-black text-zinc-950">{labels.title}</p>
          <p className="mt-2">{labels.body}</p>
          <p className="mt-2 font-bold">{labels.warning}</p>
          <p className="mt-3 text-xs font-black uppercase text-amber-800">
            {statusText}
          </p>
        </div>
      </div>
      {visibleError ? (
        <p className="mt-4 border border-red-200 bg-white p-3 text-xs font-bold leading-5 text-red-700">
          {visibleError}
        </p>
      ) : null}
      <button
        className="button-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!hasDestination || isRedirecting}
        onClick={continueToPayment}
        type="button"
      >
        {isRedirecting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CreditCard className="size-4" />
        )}
        {isRedirecting ? labels.redirecting : labels.action}
      </button>
    </div>
  );
}
