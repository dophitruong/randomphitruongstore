import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, ZALO_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Chính sách vận chuyển | Shipping Policy",
  description:
    "Chính sách vận chuyển nội địa và quốc tế của random.phitruong."
};

export default function ShippingPolicyPage() {
  return (
    <div className="container-shell max-w-4xl py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
        Chính sách vận chuyển / Shipping Policy
      </h1>
      <p className="mt-2 text-xs text-zinc-500">Cập nhật lần cuối: 05/07/2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700">
        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-lg font-bold text-zinc-900">
            1. Khu vực giao hàng / Delivery Areas
          </h2>
          <p className="mt-2">
            random.phitruong hỗ trợ giao hàng toàn quốc tại Việt Nam. Các đơn
            quốc tế đến Singapore, Hàn Quốc, Đài Loan và Nhật Bản được xác nhận
            trực tiếp trước khi đặt hàng để kiểm tra phí vận chuyển, thời gian
            giao dự kiến và yêu cầu hải quan.
          </p>
          <p className="mt-2 italic text-zinc-500">
            random.phitruong supports nationwide delivery in Vietnam.
            International orders to Singapore, Korea, Taiwan and Japan are
            confirmed directly before purchase to verify shipping fees, delivery
            estimates and customs requirements.
          </p>
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-lg font-bold text-zinc-900">
            2. Thời gian giao hàng / Delivery Timeline
          </h2>
          <p className="mt-2">
            Thời gian giao hàng thông thường là 7-10 ngày làm việc kể từ khi
            đơn hàng và khoản cọc được xác nhận. Thời gian có thể thay đổi do
            lịch vận chuyển quốc tế, thông quan hoặc tình trạng bất khả kháng.
          </p>
          <p className="mt-2 italic text-zinc-500">
            The usual delivery timeline is 7-10 business days after order and
            deposit confirmation. Timing may vary because of international
            transit schedules, customs clearance or force majeure events.
          </p>
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-lg font-bold text-zinc-900">
            3. Phí vận chuyển / Shipping Fees
          </h2>
          <p className="mt-2">
            Phí vận chuyển nội địa được báo theo khu vực nhận hàng và đơn vị
            vận chuyển phù hợp. Phí vận chuyển quốc tế được báo riêng sau khi
            shop xác nhận quốc gia nhận hàng, kích thước kiện hàng và yêu cầu
            hải quan.
          </p>
          <p className="mt-2 italic text-zinc-500">
            Domestic shipping fees depend on destination and carrier.
            International shipping fees are quoted separately after destination,
            parcel size and customs requirements are confirmed.
          </p>
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-lg font-bold text-zinc-900">
            4. Theo dõi và hỗ trợ / Tracking & Support
          </h2>
          <p className="mt-2">
            Khách hàng có thể liên hệ qua Zalo {ZALO_PHONE} hoặc email{" "}
            <a className="text-amber-800 underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            để nhận cập nhật tình trạng đơn hàng. Xem thêm{" "}
            <Link className="text-amber-800 underline" href="/contact">
              thông tin liên hệ
            </Link>
            .
          </p>
          <p className="mt-2 italic text-zinc-500">
            Customers can contact Zalo {ZALO_PHONE} or email {CONTACT_EMAIL} for
            order status updates.
          </p>
        </section>
      </div>
    </div>
  );
}
