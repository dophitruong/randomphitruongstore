import { FloatingZalo } from "@/components/floating-zalo";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileNavBar } from "@/components/mobile-nav-bar";
import { CartProvider } from "@/components/cart-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { AuthProvider } from "@/context/auth-context";
import {
  getCurrencySettings,
  resolveRequestCurrency
} from "@/lib/currency-settings";
import { createPerfContext, withPerfTiming } from "@/lib/perf-diagnostics";

export default async function StoreLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const perf = createPerfContext("store.layout");
  const currencySettings = await withPerfTiming(
    perf,
    "store.currency-settings",
    () => getCurrencySettings(),
    { cache: "unknown" }
  );
  const currency = await withPerfTiming(
    perf,
    "store.resolve-currency",
    () => resolveRequestCurrency(currencySettings)
  );

  return (
    <AuthProvider>
      <CurrencyProvider
        initialCurrency={currency}
        initialSettings={currencySettings}
      >
        <CartProvider>
          <Header />
          {/* pb-16 on mobile to prevent sticky MobileNavBar from overlapping footer content */}
          <main className="pb-16 lg:pb-0">{children}</main>
          <Footer />
          <FloatingZalo />
          <MobileNavBar />
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
