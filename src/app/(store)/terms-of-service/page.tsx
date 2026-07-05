import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ | Terms of Service",
  description: "Điều khoản sử dụng dịch vụ đặt hàng và mua sắm tại random.phitruong."
};

export default function TermsOfServicePage() {
  return (
    <div className="container-shell py-14 max-w-4xl">
      <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">Điều khoản dịch vụ / Terms of Service</h1>
      <p className="text-xs text-zinc-500 mt-2">Cập nhật lần cuối: 05/07/2026</p>

      <div className="mt-8 space-y-6 text-sm text-zinc-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">1. Quy trình đặt hàng & đặt cọc / Ordering & Deposit Policy</h2>
          <p className="mt-2">
            Vì chúng tôi hoạt động theo mô hình order các sản phẩm thời trang cao cấp từ nước ngoài, khách hàng vui lòng thực hiện đặt cọc (ví dụ: cọc 50% hoặc thanh toán trước 100%) để xác nhận đơn hàng. Sau khi đơn hàng đã được chốt và đặt với nhà cung cấp quốc tế, thông tin size, màu và mẫu không thể thay đổi hoặc hủy bỏ. Tiền cọc sẽ không được hoàn lại nếu khách hàng đơn phương hủy đơn.
          </p>
          <p className="mt-2 italic text-zinc-500">
            Since we operate on a custom overseas order model for high-end streetwear, customers are required to make a deposit (e.g., 50% deposit or 100% full payment) to confirm the order. Once the order is placed with international suppliers, details (size, color, style) cannot be changed or cancelled. The deposit is non-refundable if the customer unilaterally cancels the order.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">2. Giao hàng & vận chuyển / Shipping & Delivery</h2>
          <p className="mt-2">
            Thời gian giao hàng trung bình từ 7–10 ngày làm việc kể từ ngày đặt cọc thành công. Thời gian này có thể thay đổi nhẹ tùy thuộc vào tiến độ thông quan quốc tế và đơn vị vận chuyển. Chúng tôi sẽ cập nhật liên tục tiến độ vận chuyển cho khách hàng.
          </p>
          <p className="mt-2 italic text-zinc-500">
            Average delivery time is 7–10 business days from successful deposit. This timeline may vary slightly depending on international customs clearance and shipping carriers. We will keep customers updated on the transit status.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">3. Chính sách đổi trả & hoàn tiền / Exchange & Refund Policy</h2>
          <p className="mt-2">
            Chúng tôi hỗ trợ đổi sản phẩm miễn phí hoặc hoàn tiền 100% nếu sản phẩm nhận được bị lỗi nặng từ nhà sản xuất hoặc sai mẫu mã, màu sắc, kích thước so với thỏa thuận đơn hàng ban đầu. Mọi yêu cầu đổi trả cần được gửi kèm video khui hàng trong vòng 3 ngày kể từ ngày nhận hàng.
          </p>
          <p className="mt-2 italic text-zinc-500">
            We support free product exchange or 100% refund if the product is defective by the manufacturer or does not match the confirmed specifications (style, color, size). All exchange/refund requests must include an unboxing video and be submitted within 3 days of receipt.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">4. Bản quyền & Thương hiệu / Copyright & Trademark Disclaimer</h2>
          <p className="mt-2">
            Các hình ảnh, thương hiệu sản phẩm và nhãn hiệu xuất hiện trên website chỉ nhằm mục đích minh họa và đại diện cho các sản phẩm order thời trang thực tế. Chúng tôi tôn trọng quyền sở hữu trí tuệ của các hãng sản xuất và nhà cung cấp.
          </p>
          <p className="mt-2 italic text-zinc-500">
            Product images, brand names, and trademarks shown on the website are for illustrative and representative purposes only for the actual custom orders. We respect the intellectual property rights of all manufacturing brands and suppliers.
          </p>
        </section>
      </div>
    </div>
  );
}
