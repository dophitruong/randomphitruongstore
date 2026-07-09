import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShirt,
  faBoxesStacked,
  faHandHoldingDollar,
  faClipboardList,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { getPrisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Trạng thái đơn hàng
const ORDER_STATUS_LABELS: Record<string, { text: string; classes: string }> = {
  PENDING_DEPOSIT: { text: "Chờ cọc", classes: "bg-amber-100 text-amber-800 border-amber-200" },
  DEPOSITED: { text: "Đã cọc", classes: "bg-blue-100 text-blue-800 border-blue-200" },
  ORDERED: { text: "Đã đặt hàng", classes: "bg-purple-100 text-purple-800 border-purple-200" },
  SHIPPED_TO_VN: { text: "Đang về VN", classes: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  ARRIVED_AT_VN: { text: "Đã về VN", classes: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  DELIVERING: { text: "Đang giao", classes: "bg-orange-100 text-orange-800 border-orange-200" },
  COMPLETED: { text: "Hoàn thành", classes: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED: { text: "Đã hủy", classes: "bg-rose-100 text-rose-800 border-rose-200" }
};

// Trạng thái yêu cầu tìm nguồn
const INQUIRY_STATUS_LABELS: Record<string, { text: string; classes: string }> = {
  NEW: { text: "Mới", classes: "bg-blue-100 text-blue-800 border-blue-200" },
  QUOTED: { text: "Đã báo giá", classes: "bg-amber-100 text-amber-800 border-amber-200" },
  ORDER_CONVERTED: { text: "Đã lên đơn", classes: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  REJECTED: { text: "Từ chối", classes: "bg-zinc-150 text-zinc-650 border-zinc-300" }
};

export default async function AdminDashboardPage() {
  const prisma = getPrisma();

  const [
    productsCount,
    ordersCount,
    pendingDepositCount,
    requestsCount,
    recentOrders,
    recentInquiries
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_DEPOSIT" } }),
    prisma.productInquiry.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true }
    }),
    prisma.productInquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const stats = [
    {
      label: "Tổng sản phẩm",
      value: productsCount,
      icon: faShirt,
      themeClass: "border-l-4 border-l-blue-500 border-blue-100 bg-gradient-to-br from-white to-blue-50/20",
      iconColor: "text-blue-500"
    },
    {
      label: "Tổng đơn hàng",
      value: ordersCount,
      icon: faBoxesStacked,
      themeClass: "border-l-4 border-l-emerald-500 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20",
      iconColor: "text-emerald-500"
    },
    {
      label: "Đơn chờ cọc",
      value: pendingDepositCount,
      icon: faHandHoldingDollar,
      themeClass: "border-l-4 border-l-amber-500 border-amber-100 bg-gradient-to-br from-white to-amber-50/20",
      iconColor: "text-amber-500"
    },
    {
      label: "Yêu cầu tìm nguồn",
      value: requestsCount,
      icon: faClipboardList,
      themeClass: "border-l-4 border-l-purple-500 border-purple-100 bg-gradient-to-br from-white to-purple-50/20",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow text-zinc-500">Tổng quan</p>
        <h1 className="mt-2 text-4xl font-black">Bảng điều khiển</h1>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          return (
            <article
              className={`border p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] rounded-r-lg transition-transform duration-200 hover:-translate-y-0.5 ${stat.themeClass}`}
              key={stat.label}
            >
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                  {stat.label}
                </span>
                <FontAwesomeIcon icon={stat.icon} className={`text-base ${stat.iconColor}`} />
              </div>
              <p className="mt-8 text-4xl font-black text-zinc-900">{stat.value}</p>
            </article>
          );
        })}
      </section>

      {/* Recent Data Sections */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Orders Column */}
        <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-lg p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800">Đơn hàng gần đây</h2>
            <Link 
              href="/admin/orders" 
              className="text-xs font-bold text-[#a72b1f] hover:underline flex items-center gap-1"
            >
              Xem tất cả <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full min-w-[500px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-y border-zinc-200 text-zinc-500 font-bold uppercase">
                  <th className="py-2.5 px-4">Mã đơn</th>
                  <th className="py-2.5 px-4">Khách hàng</th>
                  <th className="py-2.5 px-4">Tổng tiền</th>
                  <th className="py-2.5 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-400">Không có đơn hàng nào</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusInfo = ORDER_STATUS_LABELS[order.status] || { text: order.status, classes: "bg-zinc-100 text-zinc-800" };
                    return (
                      <tr key={order.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                          <Link href="/admin/orders" className="hover:text-[#a72b1f]">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-zinc-800">{order.customer.fullName}</p>
                          <p className="text-[10px] text-zinc-400">{order.customer.phone}</p>
                        </td>
                        <td className="py-3 px-4 font-extrabold text-zinc-900">
                          {order.totalAmount.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${statusInfo.classes}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Sourcing Requests Column */}
        <section className="lg:col-span-5 bg-white border border-zinc-200 rounded-lg p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800">Yêu cầu tìm nguồn mới nhất</h2>
            <Link 
              href="/admin/order-requests" 
              className="text-xs font-bold text-[#a72b1f] hover:underline flex items-center gap-1"
            >
              Xem tất cả <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentInquiries.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-400">Không có yêu cầu nào</p>
            ) : (
              recentInquiries.map((inquiry) => {
                const statusInfo = INQUIRY_STATUS_LABELS[inquiry.status] || { text: inquiry.status, classes: "bg-zinc-100 text-zinc-800" };
                return (
                  <div key={inquiry.id} className="text-xs p-3 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-150 rounded transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-800">{inquiry.fullName}</span>
                      <span className={`px-1.5 py-0.5 border text-[9px] font-bold rounded-full ${statusInfo.classes}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>SDT: {inquiry.phone}</span>
                      <span>{new Date(inquiry.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    {inquiry.customerMessage && (
                      <p className="mt-2 text-[11px] text-zinc-500 line-clamp-1 border-t border-zinc-100 pt-1.5 italic">
                        "{inquiry.customerMessage}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
