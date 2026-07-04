"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CreditCard, ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useState, useEffect, useRef, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { Locale } from "@/i18n/request";
import type { Province, Ward } from "vietnam-address-database";
import { ZALO_URL } from "@/lib/constants";
import { formatMoney } from "@/lib/currency";
import { trackEvent } from "@/lib/analytics";
import {
  hasPaymentDestination,
  type PaymentCheckoutData
} from "@/lib/payment-navigation";
import type { ProductWithImages } from "@/types";
import { BankTransferBox } from "./bank-transfer-box";
import { InternationalShippingNotice } from "./international-shipping-notice";
import { SePayRedirectNotice } from "./sepay-redirect-notice";
import { useCart } from "./cart-provider";
import { useCurrency } from "./currency-provider";
import { Money } from "./money";
import { cn } from "@/lib/utils";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Required"),
  phone: z.string().trim().min(9, "Required"),
  email: z.string().trim().email("Required"),
  address: z.string().trim().min(5, "Required"),
  province: z.string().trim().min(2, "Required"),
  district: z.string().trim().min(2, "Required"),
  ward: z.string().trim().min(2, "Required"),
  note: z.string().max(1000).optional(),
  shippingRegion: z.enum(["VIETNAM", "SINGAPORE", "KOREA", "TAIWAN", "JAPAN"]),
  paymentMethod: z.enum([
    "DEPOSIT_50_BANK_ZALO",
    "ONLINE_100_SEPAY"
  ]),
  noChangePolicyAck: z.boolean().refine((value) => value === true, "Required")
});

type CheckoutValues = z.infer<typeof checkoutSchema>;
type CreatedOrder = {
  id: string;
  orderNumber: string;
  payments?: Array<{ amount: number }>;
  paymentMethod: CheckoutValues["paymentMethod"];
  status: string;
};

export function CheckoutForm({
  product,
  selectedSize,
  selectedColor,
  selectedVariantId,
  labels
}: {
  product: ProductWithImages | null;
  selectedSize: string;
  selectedColor: string;
  selectedVariantId?: string;
  labels: Record<string, string>;
}) {
  const locale = useLocale() as Locale;
  const { currency } = useCurrency();
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart();
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [sePayPaymentData, setSePayPaymentData] =
    useState<PaymentCheckoutData | null>(null);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingRegion: "VIETNAM",
      paymentMethod: "DEPOSIT_50_BANK_ZALO",
      noChangePolicyAck: false,
      note: ""
    }
  });
  const region = useWatch({ control, name: "shippingRegion" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const province = useWatch({ control, name: "province" });
  const ward = useWatch({ control, name: "ward" });

  const [vnData, setVnData] = useState<{ provinces: Province[]; wards: Ward[] } | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const loadingStartedRef = useRef(false);

  // Dynamically load the Vietnam address database on-demand
  useEffect(() => {
    if (region === "VIETNAM" && !vnData && !loadingStartedRef.current) {
      loadingStartedRef.current = true;
      setTimeout(() => setAddressLoading(true), 0);
      import("vietnam-address-database")
        .then((module) => {
          const data = module.default;
          const provinces = (data.find((x) => x.name === "provinces")?.data || []) as Province[];
          const wards = (data.find((x) => x.name === "wards")?.data || []) as Ward[];
          setVnData({ provinces, wards });
          setAddressLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load Vietnam address database:", err);
          setAddressLoading(false);
          loadingStartedRef.current = false;
        });
    }
  }, [region, vnData]);

  // Reset or initialize values when switching region
  useEffect(() => {
    if (region === "VIETNAM") {
      setValue("district", "N/A");
    } else {
      setValue("district", "");
      setValue("province", "");
      setValue("ward", "");
    }
  }, [region, setValue]);

  // Reset ward selection if province selection changes
  const prevProvinceRef = useRef(province);
  useEffect(() => {
    if (region === "VIETNAM" && prevProvinceRef.current !== province) {
      setValue("ward", "");
    }
    prevProvinceRef.current = province;
  }, [province, region, setValue]);

  const filteredWards = useMemo(() => {
    if (!province || !vnData) return [];
    const selectedProvinceObj = vnData.provinces.find(
      (p) => p.name === province
    );
    if (!selectedProvinceObj) return [];
    return vnData.wards.filter(
      (w) => w.province_code === selectedProvinceObj.province_code
    );
  }, [province, vnData]);

  const selectedVariant = product?.variants?.find(
    (variant) => variant.id === selectedVariantId
  );
  const selectedUnitPrice = product
    ? product.basePrice + (selectedVariant?.priceAdjustment ?? 0)
    : 0;

  const finalSubtotal = product ? selectedUnitPrice : cartSubtotal;
  const currentPaymentAmount =
    paymentMethod === "DEPOSIT_50_BANK_ZALO"
      ? Math.ceil(finalSubtotal / 2)
      : finalSubtotal;
  const paymentAmount = createdOrder?.payments?.[0]?.amount;

  async function onSubmit(values: CheckoutValues) {
    setServerError("");
    setSePayPaymentData(null);

    if (!product && cartItems.length === 0) {
      setServerError("Your cart is empty");
      return;
    }

    if (values.shippingRegion !== "VIETNAM") {
      const productName = product
        ? (locale === "vi" ? product.nameVi : product.nameEn)
        : "Cart Items";
      const message = encodeURIComponent(
        `International order: ${productName}, region ${values.shippingRegion}. Customer: ${values.fullName}, ${values.phone}`
      );
      trackEvent("click_zalo");
      window.location.assign(`${ZALO_URL}?text=${message}`);
      return;
    }

    const orderItems = product
      ? [
          {
            productId: product.id,
            ...(selectedVariantId ? { productVariantId: selectedVariantId } : {}),
            quantity: 1,
            size: selectedSize,
            color: selectedColor
          }
        ]
      : cartItems.map((item) => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        }));

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        shippingRegion: "VIETNAM",
        selectedCurrency: currency,
        items: orderItems
      })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      setServerError(result.error ?? "Unable to create order");
      return;
    }

    const order = result.data;
    setCreatedOrder(order);
    if (!product) {
      clearCart();
    }

    if (values.paymentMethod === "ONLINE_100_SEPAY") {
      const paymentResponse = await fetch("/api/payment/sepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id
        })
      });
      const paymentResult = await paymentResponse.json();
      if (
        paymentResponse.ok &&
        paymentResult.success &&
        hasPaymentDestination(paymentResult.data)
      ) {
        setSePayPaymentData(paymentResult.data);
        return;
      }
      setServerError(paymentResult.error ?? "Unable to create SePay payment");
      return;
    }


  }

  if (createdOrder) {
    const requiresSePayRedirect =
      createdOrder.paymentMethod === "ONLINE_100_SEPAY" &&
      createdOrder.status === "PENDING_ONLINE_PAYMENT";

    return (
      <section className="mx-auto max-w-2xl py-10">
        <p className="eyebrow text-zinc-500">{labels.success}</p>
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">
          {createdOrder.orderNumber}
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          {labels.successBody} {createdOrder.orderNumber}
        </p>
        {createdOrder.paymentMethod === "DEPOSIT_50_BANK_ZALO" ? (
          <div className="mt-8">
            <BankTransferBox
              amount={paymentAmount}
              instruction={labels.bankInstruction}
              orderNumber={createdOrder.orderNumber}
              title={labels.bankTitle}
            />
          </div>
        ) : null}
        {requiresSePayRedirect ? (
          <SePayRedirectNotice
            error={serverError}
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
            paymentData={sePayPaymentData}
          />
        ) : null}
      </section>
    );
  }

  return (
    <form
      className="grid gap-10 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] lg:gap-10 xl:gap-12"
      onSubmit={handleSubmit(onSubmit, (errs) => {
        const firstErrorKey = Object.keys(errs)[0];
        if (firstErrorKey) {
          const errorElement = document.getElementsByName(firstErrorKey)[0] ||
                               document.querySelector(`[name^="${firstErrorKey}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            if (typeof (errorElement as HTMLElement).focus === "function") {
              (errorElement as HTMLElement).focus();
            }
          }
        }
      })}
    >
      <section>
        <h2 className="text-xl font-black">{labels.customerInfo}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            error={errors.fullName?.message}
            label={labels.fullName}
            registration={register("fullName")}
          />
          <Field
            error={errors.phone?.message}
            label={labels.phone}
            registration={register("phone")}
          />
          <div className="sm:col-span-2">
            <Field
              error={errors.email?.message}
              label={labels.email}
              registration={register("email")}
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              error={errors.address?.message}
              label={labels.address}
              registration={register("address")}
            />
          </div>
          {region === "VIETNAM" ? (
            <>
              {/* Hidden District, Province, and Ward fields to pass schema validation */}
              <input type="hidden" {...register("district")} />
              <input type="hidden" {...register("province")} />
              <input type="hidden" {...register("ward")} />
              <div className="sm:col-span-1">
                <AddressDropdown
                  label={labels.province}
                  value={province || ""}
                  options={
                    vnData?.provinces.map((p) => ({
                      label: p.name,
                      value: p.name
                    })) || []
                  }
                  onChange={(val) =>
                    setValue("province", val, { shouldValidate: true })
                  }
                  placeholder="Chọn Tỉnh / Thành phố"
                  error={errors.province?.message}
                  isLoading={addressLoading}
                />
              </div>
              <div className="sm:col-span-1">
                <AddressDropdown
                  label={labels.ward}
                  value={ward || ""}
                  options={
                    filteredWards.map((w) => ({
                      label: w.name,
                      value: w.name
                    })) || []
                  }
                  onChange={(val) =>
                    setValue("ward", val, { shouldValidate: true })
                  }
                  placeholder="Chọn Phường / Xã"
                  disabled={!province}
                  error={errors.ward?.message}
                  isLoading={addressLoading}
                />
              </div>
            </>
          ) : (
            <>
              <Field
                error={errors.province?.message}
                label={labels.province}
                registration={register("province")}
              />
              <Field
                error={errors.district?.message}
                label={labels.district}
                registration={register("district")}
              />
              <div className="sm:col-span-2">
                <Field
                  error={errors.ward?.message}
                  label={labels.ward}
                  registration={register("ward")}
                />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <span className="label mb-2 block">{labels.region}</span>
            <input type="hidden" {...register("shippingRegion")} />
            <div className="flex flex-wrap gap-2">
              {([
                { value: "VIETNAM", label: "Vietnam" },
                { value: "SINGAPORE", label: "Singapore" },
                { value: "KOREA", label: "Korea" },
                { value: "TAIWAN", label: "Taiwan" },
                { value: "JAPAN", label: "Japan" }
              ] as const).map((opt) => (
                <button
                  className={cn(
                    "border px-4 py-2 text-xs font-bold uppercase transition-all duration-200",
                    region === opt.value
                      ? "border-[#a72b1f] bg-[#a72b1f] text-white"
                      : "border-zinc-300 bg-white hover:border-[#a72b1f] hover:text-[#a72b1f]"
                  )}
                  key={opt.value}
                  onClick={() => setValue("shippingRegion", opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <label className="sm:col-span-2">
            <span className="label">{labels.note}</span>
            <textarea className="field min-h-28 resize-y" {...register("note")} />
          </label>
        </div>

        {region === "VIETNAM" ? (
          <fieldset className="mt-8">
            <legend className="text-xl font-black">{labels.payment}</legend>
            <div className="mt-4 grid gap-3">
              <PaymentOption
                label={labels.deposit}
                registration={register("paymentMethod")}
                value="DEPOSIT_50_BANK_ZALO"
              />
              <PaymentOption
                label={labels.sepay}
                registration={register("paymentMethod")}
                value="ONLINE_100_SEPAY"
                icon={<CreditCard size={18} />}
              />

            </div>
            {paymentMethod === "DEPOSIT_50_BANK_ZALO" ? (
              <div className="mt-5">
                <BankTransferBox
                  amount={Math.ceil(finalSubtotal / 2)}
                  instruction={labels.bankInstruction}
                  title={labels.bankTitle}
                />
              </div>
            ) : null}
          </fieldset>
        ) : (
          <div className="mt-8">
            <InternationalShippingNotice
              body={labels.internationalCustoms}
              title={labels.region}
            />
          </div>
        )}
      </section>

      <aside className="h-fit border border-black bg-white p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-black">{labels.summary}</h2>
        {product ? (
          <div className="mt-5 flex gap-4">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-zinc-200">
              {product.images[0] ? (
                <Image
                  alt={locale === "vi" ? product.images[0].altVi : product.images[0].altEn}
                  className="object-cover"
                  fill
                  sizes="96px"
                  src={product.images[0].url}
                />
              ) : null}
            </div>
            <div className="text-sm">
              <p className="font-bold">
                {locale === "vi" ? product.nameVi : product.nameEn}
              </p>
              <p className="mt-2 text-zinc-500">Size: {selectedSize}</p>
              <p className="text-zinc-500">Color: {selectedColor}</p>
              <p className="mt-2 font-bold">
                <Money amountVnd={selectedUnitPrice} />
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.productVariantId}-${item.size}`} className="flex gap-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-zinc-200">
                  {item.imageUrl ? (
                    <Image
                      alt={item.name}
                      className="object-cover"
                      fill
                      sizes="64px"
                      src={item.imageUrl}
                    />
                  ) : null}
                </div>
                <div className="text-sm">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-zinc-500">
                    {item.size} · {item.color} · x{item.quantity}
                  </p>
                  <p className="mt-1 font-bold">
                    <Money amountVnd={item.price} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 flex justify-between border-t border-black pt-4 font-black">
          <span>{labels.total}</span>
          <span><Money amountVnd={finalSubtotal} /></span>
        </div>
        {currency === "USD" ? (
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            {labels.paymentAmount}:{" "}
            <span className="font-bold text-zinc-800">
              {formatMoney(currentPaymentAmount, "VND")}
            </span>
          </p>
        ) : null}
        <label className="mt-5 flex cursor-pointer items-start gap-3 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <input
            className="mt-0.5 size-5 shrink-0 accent-black cursor-pointer"
            type="checkbox"
            {...register("noChangePolicyAck")}
          />
          <span>{labels.warning}</span>
        </label>
        {errors.noChangePolicyAck ? (
          <p className="error-text mt-2">{errors.noChangePolicyAck.message}</p>
        ) : null}
        {serverError ? <p className="error-text mt-4">{serverError}</p> : null}
        <button
          className="button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? labels.loading : labels.placeOrder}
          <ArrowRight size={16} className="translate-y-[-0.5px]" />
        </button>
        {isSubmitting && paymentMethod === "ONLINE_100_SEPAY" && (
          <p className="text-xs text-amber-600 font-bold text-center mt-3 animate-pulse">
            Vui lòng đợi một chút để QR thanh toán hiện lên... / Please wait a moment for the payment QR code to appear...
          </p>
        )}
      </aside>
    </form>
  );
}

function Field({
  label,
  error,
  registration
}: {
  label: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<CheckoutValues>>["register"]>;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field" {...registration} />
      {error ? <span className="error-text">{error}</span> : null}
    </label>
  );
}

function PaymentOption({
  value,
  label,
  description,
  registration,
  icon
}: {
  value: CheckoutValues["paymentMethod"];
  label: string;
  description?: string;
  registration: ReturnType<ReturnType<typeof useForm<CheckoutValues>>["register"]>;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-zinc-300 bg-white p-4 has-[:checked]:border-black has-[:checked]:ring-1 has-[:checked]:ring-black">
      <input className="mt-0.5 accent-black" type="radio" value={value} {...registration} />
      <span>
        <span className="block text-sm font-bold flex items-center gap-2">
          {icon}
          {label}
        </span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-zinc-500">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function AddressDropdown({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
  error,
  isLoading
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  error?: string;
  isLoading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search query
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search]);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className="relative" ref={dropdownRef}>
      <span className="label">{label}</span>
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className={cn(
          "flex min-h-12 w-full items-center justify-between border bg-white px-3.5 py-3 text-left text-sm outline-none transition-all duration-200",
          (disabled || isLoading)
            ? "border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed"
            : isOpen
            ? "border-zinc-950 ring-1 ring-zinc-950 text-zinc-950"
            : "border-zinc-300 hover:border-zinc-400 text-zinc-800"
        )}
      >
        <span className="font-semibold truncate">
          {isLoading
            ? "Đang tải danh sách..."
            : selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-zinc-500 transition-transform duration-300 ease-out shrink-0",
            isOpen && "rotate-180 text-zinc-950"
          )}
        />
      </button>

      {isOpen && !disabled && !isLoading && (
        <div className="absolute left-0 z-50 mt-1.5 w-full border border-black bg-white shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search bar inside the dropdown if there are many options */}
          {options.length > 5 && (
            <div className="border-b border-zinc-200 p-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm... / Search..."
                className="h-8 w-full border border-zinc-300 px-2.5 text-xs outline-none focus:border-black"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto py-1 text-xs">
            {filtered.length === 0 ? (
              <li className="px-4 py-2.5 text-zinc-400 text-center">
                Không tìm thấy / No results found
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2 text-left hover:bg-zinc-100 hover:text-black",
                      opt.value === value
                        ? "bg-zinc-50 font-black text-black"
                        : "text-zinc-600"
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.value === value && (
                      <Check className="size-3.5 text-[#a72b1f] shrink-0 translate-y-[-0.5px]" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {error && <span className="error-text mt-1">{error}</span>}
    </div>
  );
}
