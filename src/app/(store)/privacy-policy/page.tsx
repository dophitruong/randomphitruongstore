import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Privacy Policy",
  description: "Chính sách bảo mật thông tin khách hàng của random.phitruong."
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-shell py-14 max-w-4xl">
      <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">Chính sách bảo mật / Privacy Policy</h1>
      <p className="text-xs text-zinc-500 mt-2">Cập nhật lần cuối: 05/07/2026</p>

      <div className="mt-8 space-y-6 text-sm text-zinc-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">1. Thu thập thông tin cá nhân / Collection of Personal Information</h2>
          <p className="mt-2">
            Chào mừng bạn đến với <strong>random.phitruong</strong>. Chúng tôi thu thập thông tin cá nhân khi bạn đặt hàng hoặc sử dụng dịch vụ tư vấn của chúng tôi. Thông tin bao gồm: tên, số điện thoại, địa chỉ giao hàng, email và tài khoản mạng xã hội (Instagram/Zalo) nhằm mục đích xử lý đơn hàng và tư vấn chi tiết sản phẩm.
          </p>
          <p className="mt-2 italic text-zinc-500">
            Welcome to random.phitruong. We collect personal information such as name, phone number, shipping address, email, and social media handles (Instagram/Zalo) when you place an order or contact us for consultation to fulfill order delivery and custom service requests.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">2. Sử dụng thông tin / Use of Information</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Xử lý giao dịch, tạo đơn hàng và sắp xếp vận chuyển quốc tế và nội địa.</li>
            <li>Gửi thông tin cập nhật trạng thái đơn hàng và xác nhận cọc.</li>
            <li>Hỗ trợ khách hàng đổi trả hoặc hoàn tiền theo quy định.</li>
          </ul>
          <ul className="list-disc pl-5 mt-2 space-y-1 italic text-zinc-500">
            <li>Process transactions, create orders, and arrange international and domestic shipping.</li>
            <li>Send order status updates and deposit confirmations.</li>
            <li>Assist customers with exchanges, returns, and refunds according to policies.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">3. Bảo mật thông tin / Data Security</h2>
          <p className="mt-2">
            Chúng tôi cam kết bảo mật thông tin cá nhân của bạn và chỉ chia sẻ cho bên thứ ba trực tiếp phục vụ cho việc vận chuyển và xử lý thanh toán (Ví dụ: nhà vận chuyển, cổng thanh toán SePay). Chúng tôi sử dụng các biện pháp bảo mật và mã hóa truyền dữ liệu để ngăn chặn truy cập trái phép.
          </p>
          <p className="mt-2 italic text-zinc-500">
            We are committed to securing your personal information and only share it with third parties directly involved in fulfillment and payment processing (e.g., shipping carriers, SePay gateway). We use security protocols and encryption to prevent unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">4. Quyền lợi của bạn / Your Rights</h2>
          <p className="mt-2">
            Bạn có quyền yêu cầu truy cập, sửa đổi hoặc xóa thông tin cá nhân bất cứ lúc nào bằng cách liên hệ với chúng tôi qua email: <a href="mailto:randomphitruong@gmail.com" className="text-amber-800 underline">randomphitruong@gmail.com</a> hoặc nhắn trực tiếp qua Zalo/Instagram của shop.
          </p>
          <p className="mt-2 italic text-zinc-500">
            You have the right to request access, correction, or deletion of your personal information at any time by contacting us via email: randomphitruong@gmail.com or directly through our official social media channels.
          </p>
        </section>
      </div>
    </div>
  );
}
