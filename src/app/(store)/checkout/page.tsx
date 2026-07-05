import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout-form";
import {
  matchedProductVariantColor,
  productVariantMatchesSelection
} from "@/lib/product-catalog";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm delivery details and payment method."
};

type PageProps = {
  searchParams: Promise<{
    productId?: string;
    variantId?: string;
    size?: string;
    color?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations("checkout");
  const common = await getTranslations("common");
  const product = params.productId
    ? await getPrisma().product.findFirst({
        where: {
          id: params.productId,
          status: "PUBLISHED",
          isActive: true,
          stockStatus: "IN_STOCK"
        },
        include: {
          categoryRecord: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          variants: { orderBy: [{ size: "asc" }, { colorVi: "asc" }] }
        }
      })
    : null;
  const selectedVariant = params.variantId
    ? product?.variants.find(
        (variant) => productVariantMatchesSelection(variant, {
          variantId: params.variantId,
          size: params.size,
          color: params.color
        })
      )
    : null;

  if (params.productId && (!product || !selectedVariant)) {
    return (
      <div className="container-shell min-h-[60vh] py-20 text-center">
        <h1 className="text-4xl font-black">{t("missingProduct")}</h1>
        <Link className="button-primary mt-8" href="/shop">
          {t("backToShop")}
        </Link>
      </div>
    );
  }
  const selectedColor =
    selectedVariant && params.color
      ? (matchedProductVariantColor(selectedVariant, params.color) ?? "")
      : (selectedVariant?.colorVi ?? "");

  const labelKeys = [
    "customerInfo",
    "fullName",
    "phone",
    "email",
    "address",
    "province",
    "district",
    "ward",
    "note",
    "region",
    "payment",
    "deposit",
    "sepay",
    "summary",
    "total",
    "placeOrder",
    "success",
    "successBody",
    "bankTitle",
    "bankInstruction",
    "internationalCustoms",
    "warning",
    "paymentAmount",
    "sepayRedirectTitle",
    "sepayRedirectBody",
    "sepayRedirectWarning",
    "sepayRedirectCountdown",
    "sepayRedirectPreparing",
    "sepayRedirectAction",
    "sepayRedirecting",
    "sepayRedirectUnavailable"
  ] as const;
  const labels = Object.fromEntries(
    labelKeys.map((key) => [
      key,
      key === "sepayRedirectCountdown" ? t(key, { seconds: "{seconds}" }) : t(key)
    ])
  );

  return (
    <div className="container-shell py-10 sm:py-16">
      <p className="eyebrow text-zinc-500">{t("secureEyebrow")}</p>
      <h1 className="mt-3 mb-10 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
        {t("title")}
      </h1>
      <CheckoutForm
        labels={{ ...labels, loading: common("loading") }}
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedVariant?.size ?? ""}
        selectedVariantId={selectedVariant?.id}
      />
    </div>
  );
}
