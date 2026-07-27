"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const VALIDATION_THROTTLE_MS = 10000; // 10 seconds

export function AdminSessionValidator() {
  const router = useRouter();
  const lastCheckedRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  useEffect(() => {
    async function checkSession(options: { force?: boolean } = {}) {
      if (isCheckingRef.current) return;
      const now = Date.now();
      if (!options.force && now - lastCheckedRef.current < VALIDATION_THROTTLE_MS) {
        return;
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }

      isCheckingRef.current = true;
      try {
        const response = await fetch("/api/admin/session", {
          headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
        });

        lastCheckedRef.current = Date.now();

        if (response.status === 401) {
          window.location.href = "/admin/login";
          return;
        }

        if (response.ok) {
          const data = (await response.json()) as { authenticated?: boolean };
          if (data && data.authenticated === false) {
            window.location.href = "/admin/login";
          }
        }
      } catch (error) {
        console.warn("Transient error checking admin session status:", error);
      } finally {
        isCheckingRef.current = false;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void checkSession({ force: true });
      }
    }

    function handleFocus() {
      void checkSession({ force: true });
    }

    function handlePageShow() {
      void checkSession({ force: true });
    }

    function handleOnline() {
      void checkSession({ force: true });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("online", handleOnline);

    void checkSession();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("online", handleOnline);
    };
  }, [router]);

  return null;
}

