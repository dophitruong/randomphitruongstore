"use client";

import { useEffect, useState } from "react";

// Track retry counts at the module level so they persist across component resets (when reset() is called)
let globalRetryCount = 0;
let globalLastRetryTime = 0;

export default function AdminPanelError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Admin panel error", {
      name: error.name,
      message: error.message,
      digest: error.digest,
      stack: error.stack
    });

    // Check for Next.js ChunkLoadErrors (which often occur when assets change after a deployment)
    const isChunkError =
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("loading Chunk") ||
      error.message?.includes("error loading dynamically imported module");

    if (isChunkError) {
      console.warn("Next.js chunk loading failure detected. Reloading page to fetch latest bundles...");
      window.location.reload();
      return;
    }

    // Auto-retry transient errors up to 3 times, with a minimum 1 second cooldown
    const now = Date.now();
    if (globalRetryCount < 3 && now - globalLastRetryTime > 1000) {
      globalRetryCount++;
      globalLastRetryTime = now;
      console.warn(`AdminPanelError: Attempting automatic recovery/retry ${globalRetryCount}/3...`);

      const timer = setTimeout(() => {
        reset();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [error, reset]);

  // Reset retry counter on successful recovery / component unmount
  useEffect(() => {
    return () => {
      globalRetryCount = 0;
    };
  }, []);

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center p-6 text-center">
      <p className="eyebrow text-zinc-500 text-xs font-bold uppercase tracking-wider">Admin Panel Error</p>
      <h2 className="mt-4 text-2xl sm:text-3xl font-black text-zinc-900">Something went wrong.</h2>
      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-zinc-650">
        An unexpected error occurred. This could be due to a transient network disruption or session change.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          className="button-primary px-5 py-2 text-xs font-black uppercase tracking-wider bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
          onClick={() => {
            globalRetryCount = 0;
            reset();
          }}
          type="button"
        >
          Thử lại
        </button>
        <button
          className="px-5 py-2 text-xs font-black uppercase tracking-wider border border-zinc-300 text-zinc-700 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
          onClick={() => window.location.reload()}
          type="button"
        >
          Tải lại trang
        </button>
      </div>

      <div className="mt-10 w-full max-w-2xl text-left border border-zinc-200 rounded-md bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between text-xs font-bold text-zinc-500 hover:text-zinc-800 focus:outline-none"
        >
          <span>{showDetails ? "ẨN CHI TIẾT LỖI" : "HIỂN THỊ CHI TIẾT LỖI"}</span>
          <span className="text-[10px]">{showDetails ? "▲" : "▼"}</span>
        </button>

        {showDetails && (
          <div className="mt-3.5 space-y-2 border-t border-zinc-100 pt-3 text-xs font-mono text-zinc-700 overflow-x-auto">
            <p className="font-semibold text-rose-700">
              <span className="font-bold text-zinc-900">Error Name:</span> {error.name || "Error"}
            </p>
            <p className="font-semibold text-rose-700 break-words whitespace-pre-wrap">
              <span className="font-bold text-zinc-900">Message:</span> {error.message || "No message provided."}
            </p>
            {error.digest && (
              <p>
                <span className="font-bold text-zinc-900">Digest:</span> {error.digest}
              </p>
            )}
            {error.stack && (
              <pre className="mt-2 p-2 bg-zinc-50 border border-zinc-200 rounded text-[10px] leading-relaxed max-h-60 overflow-y-auto whitespace-pre">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

