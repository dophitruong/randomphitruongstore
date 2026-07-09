"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useCurrency } from "./currency-provider";

export function CurrencySelector() {
  const { currency, enabled, isPending, setCurrency } = useCurrency();

  if (enabled.length <= 1) {
    return null;
  }

  function toggleCurrency() {
    const currentIndex = enabled.indexOf(currency);
    const nextIndex = (currentIndex + 1) % enabled.length;
    setCurrency(enabled[nextIndex]);
  }

  return (
    <button
      aria-label="Toggle currency"
      disabled={isPending}
      onClick={toggleCurrency}
      type="button"
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all border-0 bg-transparent cursor-pointer outline-none",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      <FontAwesomeIcon icon={faCoins} className="text-[12px] text-zinc-400" />
      <span>{currency}</span>
    </button>
  );
}
