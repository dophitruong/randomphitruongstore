import type { Metadata } from "next";
import { Instagram, MessageCircle, Music2, QrCode } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact-form";
import { FAQAccordion } from "@/components/faq-accordion";
import type { Locale } from "@/i18n/request";
import {
  INSTAGRAM_URL,
  TIKTOK_URL,
  ZALO_PHONE,
  ZALO_URL
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact and FAQ",
  description:
    "Contact random.phitruong through Zalo, Instagram or TikTok and read order FAQs."
};

const faq = {
  vi: [
    ["Quy trình order như thế nào?", "Chọn sản phẩm hoặc gửi ảnh mẫu, chốt giá/size/màu, cọc 50%, shop đặt hàng và giao sau 7-10 ngày."],
    ["Cọc 50% và COD 50% hoạt động ra sao?", "Bạn chuyển khoản 50% để shop xác nhận đặt hàng. Với đơn Việt Nam, 50% còn lại được thanh toán khi nhận hàng."],
    ["Thời gian giao hàng bao lâu?", "Thời gian dự kiến là 7-10 ngày sau khi shop xác nhận cọc. Một số mẫu seasonal có thể lâu hơn và sẽ được báo trước."],
    ["Có thể đổi size hoặc màu không?", "Không. Sau khi shop và khách đã chốt size/màu và đặt với nhà cung cấp, thông tin không thể thay đổi."],
    ["Shop có giao quốc tế không?", "Có, shop hỗ trợ Hàn Quốc, Đài Loan và Nhật Bản qua tư vấn trực tiếp trên Zalo."],
    ["Đơn quốc tế cần thông tin hải quan gì?", "Tùy quốc gia, bạn có thể cần ID, hộ chiếu hoặc thẻ cư trú. Thiếu thông tin hợp lệ có thể gây chậm, hoàn hoặc mất kiện và khách hàng chịu rủi ro liên quan."]
  ],
  en: [
    ["How does the order process work?", "Choose a product or send an inspiration image, confirm price/size/color, pay a 50% deposit, then receive it in 7-10 days."],
    ["How do the 50% deposit and remaining COD work?", "Transfer 50% so the shop can place the order. For Vietnam deliveries, the remaining 50% is collected on delivery."],
    ["How long does delivery take?", "The estimate is 7-10 days after deposit confirmation. Seasonal items may take longer and will be disclosed first."],
    ["Can I change size or color?", "No. After the shop and customer confirm the option and submit it to the supplier, it cannot be changed."],
    ["Do you ship internationally?", "Yes. Korea, Taiwan and Japan orders are handled through direct Zalo consultation."],
    ["What customs information is required?", "Depending on the country, ID, passport or residence-card information may be required. Missing valid information can cause delay, return or parcel loss at the customer's risk."]
  ]
} as const;

export default async function ContactPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("contact");

  return (
    <div className="container-shell py-12 sm:py-20">
      <header className="max-w-3xl">
        <p className="eyebrow text-zinc-500">Direct support</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.05em] sm:text-7xl">
          {t("title")}
        </h1>
        <p className="mt-5 text-sm leading-6 text-zinc-600">{t("subtitle")}</p>
      </header>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <ContactForm
          labels={{
            name: t("name"),
            message: t("message"),
            send: t("send")
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            className="border border-black bg-black p-6 text-white hover:bg-zinc-800"
            href={ZALO_URL}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle />
            <p className="mt-8 font-black">Zalo</p>
            <p className="mt-1 text-sm text-white/60">{ZALO_PHONE}</p>
          </a>
          <div className="flex min-h-48 items-center justify-center border border-dashed border-zinc-400 bg-white text-center">
            <div>
              <QrCode className="mx-auto text-zinc-500" size={48} />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider">
                Zalo QR placeholder
              </p>
            </div>
          </div>
          <a
            className="border border-zinc-300 bg-white p-6 hover:border-black"
            href={INSTAGRAM_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Instagram />
            <p className="mt-8 font-black">Instagram</p>
            <p className="mt-1 text-sm text-zinc-500">@random.phitruong4</p>
          </a>
          <a
            className="border border-zinc-300 bg-white p-6 hover:border-black"
            href={TIKTOK_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Music2 />
            <p className="mt-8 font-black">TikTok</p>
            <p className="mt-1 text-sm text-zinc-500">@random.phitruong</p>
          </a>
        </div>
      </section>

      <section className="mt-10 border border-zinc-300 bg-zinc-100 p-6">
        <p className="font-black">{t("community")}</p>
        <p className="mt-2 text-sm text-zinc-600">{t("communityPlaceholder")}</p>
      </section>

      <section className="mt-20">
        <h2 className="mb-8 text-4xl font-black tracking-[-0.04em]">
          {t("faq")}
        </h2>
        <FAQAccordion
          items={faq[locale].map(([question, answer]) => ({ question, answer }))}
        />
      </section>
    </div>
  );
}
