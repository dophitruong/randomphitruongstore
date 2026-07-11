"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const VALIDATION_THROTTLE_MS = 10000; // 10 seconds

export function AdminSessionValidator() {
  const router = useRouter();
  const lastCheckedRef = useRef<number>(0);

  useEffect(() => {
    async function checkSession() {
      const now = Date.now();
      if (now - lastCheckedRef.current < VALIDATION_THROTTLE_MS) {
        return;
      }
      lastCheckedRef.current = now;

      try {
        const response = await fetch("/api/admin/session", {
          // Prevent caching of session check requests
          headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
        });

        if (response.status === 401) {
          // Session specifically rejected/expired
          window.location.href = "/admin/login";
          return;
        }

        const data = (await response.json()) as { authenticated?: boolean };
        if (data && data.authenticated === false) {
          window.location.href = "/admin/login";
        }
      } catch (error) {
        // Ignore network errors/timeout when the phone is resuming connectivity
        console.warn("Transient error checking admin session status:", error);
      }
    }

    // Trigger on visibility change (tab back to foreground)
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void checkSession();
      }
    }

    // Trigger on window focus
    function handleFocus() {
      void checkSession();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Initial check on mount
    void checkSession();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  return null;
}
