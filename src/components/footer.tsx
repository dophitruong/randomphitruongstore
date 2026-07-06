import { ArrowUpRight, Check, Facebook, Instagram, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  TIKTOK_URL,
  ZALO_PHONE,
  ZALO_URL,
  HOTLINE,
  WORKING_HOURS
} from "@/lib/constants";
import { TikTokIcon, ZaloIcon } from "./brand-icons";
import { TrackedLink } from "./tracked-link";

export async function Footer() {
  const t = await getTranslations("footer");
  const policies = [
    t("deposit"),
    t("delivery"),
    t("returns"),
    t("refund")
  ];
  const legalLinks = [
    { href: "/privacy-policy", label: t("privacyPolicy") },
    { href: "/terms-of-service", label: t("termsConditions") },
    { href: "/shipping-policy", label: t("shippingPolicy") },
    { href: "/return-refund-policy", label: t("returnRefundPolicy") },
    { href: "/contact", label: t("contactInformation") },
    { href: "/contact#faq", label: "FAQ" }
  ];

  return (
    <footer className="border-t border-white/15 bg-[#11100e] text-white">
      <div className="container-shell grid gap-12 py-14 lg:grid-cols-[1fr_1.1fr_0.8fr] xl:grid-cols-[1fr_1.2fr_1fr] lg:py-16 xl:py-20">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-white">
              <Image
                alt={`${BRAND_NAME} logo`}
                className="object-contain"
                fill
                sizes="48px"
                src="/truongphistore/android-chrome-192x192.png"
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xl font-black">{BRAND_NAME}</p>
              <p className="text-[0.55rem] uppercase tracking-[0.22em] text-white/40">
                Sukajan order · Vietnam
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
            {t("description")}
          </p>
          <div className="mt-7 flex gap-3">
            <TrackedLink
              aria-label="Instagram"
              className="grid size-11 place-items-center border border-white/20 hover:bg-white hover:text-black"
              eventName="click_instagram"
              href={INSTAGRAM_URL}
              rel="noreferrer"
              target="_blank"
            >
              <Instagram aria-hidden="true" size={18} />
            </TrackedLink>
            <a
              aria-label="TikTok"
              className="grid size-11 place-items-center border border-white/20 hover:bg-white hover:text-black"
              href={TIKTOK_URL}
              rel="noreferrer"
              target="_blank"
            >
              <TikTokIcon size={18} />
            </a>
            <a
              aria-label="Facebook"
              className="grid size-11 place-items-center border border-white/20 hover:bg-white hover:text-black"
              href={FACEBOOK_URL}
              rel="noreferrer"
              target="_blank"
            >
              <Facebook aria-hidden="true" size={18} />
            </a>
          </div>
        </div>

        <div className="min-w-0">
          <p className="eyebrow text-[#d64b3d]">{t("policyTitle")}</p>
          <ul className="mt-5 grid gap-4">
            {policies.map((policy) => (
              <li
                className="flex min-w-0 items-start gap-3 border-b border-white/10 pb-4 text-sm leading-6 text-white/70"
                key={policy}
              >
                <Check
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-[#d64b3d]"
                  size={16}
                  strokeWidth={2.5}
                />
                <span>{policy}</span>
              </li>
            ))}
          </ul>
          <nav aria-label={t("legalNavigation")} className="mt-6 grid gap-2">
            {legalLinks.map((link) => (
              <Link
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-white/75 hover:text-[#d64b3d]"
                href={link.href}
                key={link.href}
              >
                {link.label}
                <ArrowUpRight aria-hidden="true" size={15} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="min-w-0">
          <p className="eyebrow text-[#d64b3d]">{t("contact")}</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-[168px_1fr] xl:grid-cols-[180px_1fr]">
            <TrackedLink
              aria-label={t("zaloAction")}
              className="relative aspect-square w-full max-w-[168px] overflow-hidden border-4 border-white bg-white"
              eventName="click_zalo"
              href={ZALO_URL}
              rel="noreferrer"
              target="_blank"
            >
              <Image
                alt={t("zaloTitle")}
                className="object-contain"
                fill
                sizes="168px"
                src="/zaloqr/zaloqr-code.png"
                unoptimized
              />
            </TrackedLink>
            <div className="min-w-0 self-center space-y-2">
              <p className="font-black leading-5">{t("zaloTitle")}</p>
              <p className="text-xs leading-5 text-white/55">
                {t("zaloBody")}
              </p>
              <div className="flex flex-col gap-2">
                <TrackedLink
                  className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#d64b3d]"
                  eventName="click_zalo"
                  href={ZALO_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ZaloIcon size={18} />
                  <span>Zalo: {ZALO_PHONE}</span>
                </TrackedLink>
                <a
                  className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"
                  href={`mailto:${CONTACT_EMAIL}`}
                >
                  <Mail size={18} />
                  <span className="whitespace-nowrap">Email: {CONTACT_EMAIL}</span>
                </a>
                <div className="text-sm font-bold text-white/70">
                  Hotline: {HOTLINE}
                </div>
                <div className="text-xs text-white/55">
                  Giờ làm việc / Hours: {WORKING_HOURS}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="container-shell flex flex-col gap-2 py-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <p>Sukajan · Curated in Vietnam</p>
        </div>
      </div>
    </footer>
  );
}
