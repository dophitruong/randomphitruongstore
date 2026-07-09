import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShirt,
  faBoxesStacked,
  faHandHoldingDollar,
  faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, orders, pendingDeposit, requests] = await Promise.all([
    getPrisma().product.count(),
    getPrisma().order.count(),
    getPrisma().order.count({ where: { status: "PENDING_DEPOSIT" } }),
    getPrisma().productInquiry.count()
  ]);
  const stats = [
    {
      label: "Tổng sản phẩm",
      value: products,
      icon: faShirt,
      themeClass: "border-l-4 border-l-blue-500 border-blue-100 bg-gradient-to-br from-white to-blue-50/20",
      iconColor: "text-blue-500"
    },
    {
      label: "Tổng đơn hàng",
      value: orders,
      icon: faBoxesStacked,
      themeClass: "border-l-4 border-l-emerald-500 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20",
      iconColor: "text-emerald-500"
    },
    {
      label: "Đơn chờ cọc",
      value: pendingDeposit,
      icon: faHandHoldingDollar,
      themeClass: "border-l-4 border-l-amber-500 border-amber-100 bg-gradient-to-br from-white to-amber-50/20",
      iconColor: "text-amber-500"
    },
    {
      label: "Yêu cầu tìm nguồn",
      value: requests,
      icon: faClipboardList,
      themeClass: "border-l-4 border-l-purple-500 border-purple-100 bg-gradient-to-br from-white to-purple-50/20",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <>
      <header>
        <p className="eyebrow text-zinc-500">Tổng quan</p>
        <h1 className="mt-2 text-4xl font-black">Bảng điều khiển</h1>
      </header>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    </>
  );
}
