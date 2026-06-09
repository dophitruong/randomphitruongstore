import { Instagram, Music2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  BRAND_NAME,
  INSTAGRAM_URL,
  TIKTOK_URL,
  ZALO_PHONE,
  ZALO_URL
} from "@/lib/constants";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-white/15 bg-black py-12 text-white">
      <div className="container-shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-xl font-black">{BRAND_NAME}</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
            {t("description")}
          </p>
        </div>
        <div>
          <p className="eyebrow text-white/40">{t("contact")}</p>
          <a className="mt-4 block text-sm hover:text-white/60" href={ZALO_URL}>
            Zalo: {ZALO_PHONE}
          </a>
          <Link className="mt-3 block text-sm hover:text-white/60" href="/contact">
            FAQ & support
          </Link>
        </div>
        <div>
          <p className="eyebrow text-white/40">{t("follow")}</p>
          <div className="mt-4 flex gap-3">
            <a
              aria-label="Instagram"
              className="border border-white/20 p-3 hover:bg-white hover:text-black"
              href={INSTAGRAM_URL}
              rel="noreferrer"
              target="_blank"
            >
              <Instagram size={18} />
            </a>
            <a
              aria-label="TikTok"
              className="border border-white/20 p-3 hover:bg-white hover:text-black"
              href={TIKTOK_URL}
              rel="noreferrer"
              target="_blank"
            >
              <Music2 size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="container-shell mt-12 border-t border-white/10 pt-5 text-xs text-white/35">
        © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
