import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, ZALO_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Chính sách đổi trả & hoàn tiền | Return & Refund Policy",
  description:
    "Chính sách đổi trả, hoàn tiền và điều kiện xử lý khiếu nại đơn hàng của random.phitruong."
};

export default function ReturnRefundPolicyPage() {
  return (
    <div className="container-shell max-w-4xl py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
        Chính sách đổi trả & hoàn tiền / Return & Refund Policy
      </h1>
      <p className="mt-2 text-xs text-zinc-500">Cập nhật lần cuối: 05/07/2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700">
        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-lg font-bold text-zinc-900">
            1. Điều kiện đổi trả / Eligible Cases
          </h2>
          <p className="mt-2">
            Shop hỗ trợ đổi sản phẩm hoặc hoàn tiền nếu sản phẩm bị lỗi nghiêm
            trọng từ nhà sản xuất, giao sai mẫu, sai màu hoặc sai kích thước so
            với xác nhận đơn hàng ban đầu.
          </p>
          <p className="mt-2 italic text-zinc-500">
            We support exchanges or refunds if the item has a serious
            manufacturer defect or differs from the confirmed style, color or
            size.
          </p>
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-lg font-bold text-zinc-900">
            2. Thời hạn gửi yêu cầu / Request Window
          </h2>
          <p className="mt-2">
            Yêu cầu đổi trả cần được gửi trong vòng 48 giờ kể từ khi nhận hàng,
            kèm video khui hàng và hình ảnh thể hiện rõ vấn đề của sản phẩm.
          </p>
          <p className="mt-2 italic text-zinc-500">
            Requests must be submitted within 48 hours of receipt with an
            unboxing video and clear photos showing the issue.
          </p>
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-lg font-bold text-zinc-900">
            3. Trường hợp không áp dụng / Non-eligible Cases
          </h2>
          <p className="mt-2">
            Chính sách không áp dụng cho trường hợp khách đổi ý, chọn sai size,
            cung cấp sai thông tin nhận hàng, sản phẩm đã qua sử dụng hoặc hư
            hỏng do bảo quản không đúng cách.
          </p>
          <p className="mt-2 italic text-zinc-500">
            This policy does not cover change of mind, customer sizing mistakes,
            incorrect delivery information, used items or damage caused by
            improper care.
          </p>
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-lg font-bold text-zinc-900">
            4. Hoàn tiền & Hoàn cọc / Refunds & Deposits
          </h2>
          <p className="mt-2">
            Tiền cọc được hoàn lại 100% nếu quý khách yêu cầu hủy đơn trong vòng 24 giờ kể từ lúc đặt cọc. Sau 24 giờ, khi shop đã tiến hành đặt hàng với nhà cung cấp nước ngoài, tiền cọc sẽ không được hoàn lại nếu khách đơn phương hủy đơn. Trong trường hợp shop không thể đổi sản phẩm phù hợp khi có lỗi, hoặc sản phẩm hết hàng từ phía nhà cung cấp, shop sẽ hoàn trả 100% tiền cọc/tiền thanh toán ngay lập tức cho quý khách.
          </p>
          <p className="mt-2 italic text-zinc-500">
            Deposits are fully refundable if the cancellation request is made within 24 hours of payment. After 24 hours, once the supplier order has been placed, the deposit is non-refundable if the customer unilaterally cancels. We refund 100% of your deposit/payment immediately if a suitable exchange is unavailable or the item is out of stock from the supplier.
          </p>
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-2 text-lg font-bold text-zinc-900">
            5. Liên hệ xử lý / Support Contact
          </h2>
          <p className="mt-2">
            Gửi yêu cầu qua Zalo {ZALO_PHONE}, email{" "}
            <a className="text-amber-800 underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            hoặc trang{" "}
            <Link className="text-amber-800 underline" href="/contact">
              liên hệ
            </Link>
            .
          </p>
          <p className="mt-2 italic text-zinc-500">
            Submit requests through Zalo {ZALO_PHONE}, email {CONTACT_EMAIL} or
            the contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
