"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import {
  hasPaymentDestination,
  type PaymentCheckoutData
} from "@/lib/payment-navigation";
import { SePayRedirectNotice } from "./sepay-redirect-notice";

interface PaymentButtonsProps {
  orderId: string;
  labels: {
    pay: string;
    error: string;
    genericError: string;
    sepayRedirectTitle: string;
    sepayRedirectBody: string;
    sepayRedirectWarning: string;
    sepayRedirectCountdown: string;
    sepayRedirectPreparing: string;
    sepayRedirectAction: string;
    sepayRedirecting: string;
    sepayRedirectUnavailable: string;
  };
}

export function PaymentButtons({
  orderId,
  labels
}: PaymentButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentCheckoutData | null>(null);
  const [error, setError] = useState("");

  const handleSePay = async () => {
    if (loading) return;

    setLoading("sepay");
    setError("");
    try {
      const response = await fetch("/api/payment/sepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId
        })
      });

      const result = await response.json();
      if (response.ok && result.success && hasPaymentDestination(result.data)) {
        setPaymentData(result.data);
      } else {
        setError(result.error ?? labels.error);
      }
    } catch (error) {
      console.error("SePay payment initiation failed", {
        name: error instanceof Error ? error.name : typeof error
      });
      setError(labels.genericError);
    } finally {
      setLoading(null);
    }
  };

  if (paymentData) {
    return (
      <SePayRedirectNotice
        error={error}
        labels={{
          title: labels.sepayRedirectTitle,
          body: labels.sepayRedirectBody,
          warning: labels.sepayRedirectWarning,
          countdown: labels.sepayRedirectCountdown,
          preparing: labels.sepayRedirectPreparing,
          action: labels.sepayRedirectAction,
          redirecting: labels.sepayRedirecting,
          unavailable: labels.sepayRedirectUnavailable
        }}
        paymentData={paymentData}
      />
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleSePay}
        disabled={!!loading}
        className="button-primary w-full flex items-center justify-center gap-2"
      >
        {loading === "sepay" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CreditCard className="size-4" />
        )}
        {labels.pay}
      </button>
      {error ? <p className="error-text text-center">{error}</p> : null}
      {loading === "sepay" && (
        <p className="text-[10px] text-amber-600 font-bold text-center mt-1 animate-pulse">
          Vui lòng đợi một chút để QR thanh toán hiện lên... / Please wait a moment for the payment QR code to appear...
        </p>
      )}
    </div>
  );
}
