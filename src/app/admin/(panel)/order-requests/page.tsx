import Image from "next/image";
import { AdminStatusSelect } from "@/components/admin-status-select";
import { AdminTable } from "@/components/admin-table";
import { AdminInquiryDeleteButton } from "@/components/admin-inquiry-delete-button";
import { StatusBadge } from "@/components/status-badge";
import { InquiryMessage } from "@/components/inquiry-message";
import { getPrisma } from "@/lib/prisma";
import {
  adminInquiryPresentationUrls,
  listAdminProductInquiries
} from "@/lib/product-inquiry";

export const dynamic = "force-dynamic";

const statuses = ["NEW", "CONTACTED", "QUOTED", "CLOSED"];

export default async function AdminProductInquiriesPage() {
  const requests = await listAdminProductInquiries(getPrisma());

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-zinc-500">Tìm nguồn hàng</p>
        <h1 className="mt-2 text-4xl font-black">Yêu cầu đặt hàng</h1>
      </header>

      {/* Desktop view */}
      <div className="hidden md:block">
        <AdminTable
          emptyMessage="Chưa có yêu cầu đặt hàng nào."
          headers={["Ảnh mẫu", "Khách hàng", "Yêu cầu đặt hàng", "Trạng thái", "Cập nhật"]}
        >
          {requests.map((request) => {
            const { imageUrl, linkUrl } = adminInquiryPresentationUrls(request);
            const socialContact =
              request.instagramHandle ?? request.zaloPhone ?? request.email ?? "-";

            return (
              <tr key={request.id}>
                <td className="px-4 py-4">
                  {imageUrl ? (
                    <a href={linkUrl ?? imageUrl} rel="noreferrer" target="_blank">
                      <Image
                        alt="Customer inspiration"
                        className="h-20 w-16 object-cover"
                        height={80}
                        src={imageUrl}
                        width={64}
                      />
                    </a>
                  ) : linkUrl ? (
                    <a
                      className="text-xs font-bold text-[#a72b1f] underline"
                      href={linkUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Mở link
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-500">-</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold">{request.fullName}</p>
                  <p className="text-xs text-zinc-500">{request.phone}</p>
                  <p className="text-xs text-zinc-500">{socialContact}</p>
                  <p className="mt-1 text-[11px] text-zinc-400 font-medium">
                    Gửi lúc: {request.createdAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                  </p>
                </td>
                <td className="max-w-xs px-4 py-4">
                  <p>Kích thước: {request.preferredSize ?? "-"}</p>
                  <p>Màu sắc: {request.preferredColor ?? "-"}</p>
                  <InquiryMessage message={request.customerMessage || ""} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <AdminStatusSelect
                      endpoint={`/api/order-requests/${request.id}`}
                      statuses={statuses}
                      value={request.status}
                    />
                    <AdminInquiryDeleteButton
                      inquiryId={request.id}
                      customerName={request.fullName}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </div>

      {/* Mobile view */}
      <div className="block md:hidden space-y-4">
        {requests.length === 0 ? (
          <div className="border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400">
            Chưa có yêu cầu đặt hàng nào.
          </div>
        ) : (
          requests.map((request) => {
            const { imageUrl, linkUrl } = adminInquiryPresentationUrls(request);
            const socialContact =
              request.instagramHandle ?? request.zaloPhone ?? request.email ?? "-";

            return (
              <div key={request.id} className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    {/* Inspiration Image */}
                    <div className="flex-shrink-0">
                      {imageUrl ? (
                        <a href={linkUrl ?? imageUrl} rel="noreferrer" target="_blank">
                          <Image
                            alt="Customer inspiration"
                            className="h-20 w-16 object-cover rounded border border-zinc-200"
                            height={80}
                            src={imageUrl}
                            width={64}
                          />
                        </a>
                      ) : linkUrl ? (
                        <a
                          className="text-xs font-bold text-[#a72b1f] underline block pt-2"
                          href={linkUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Mở link
                        </a>
                      ) : (
                        <div className="w-16 h-20 bg-zinc-50 border border-dashed border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 rounded">
                          Không có ảnh
                        </div>
                      )}
                    </div>
                    {/* Customer Info */}
                    <div>
                      <p className="font-bold text-sm text-zinc-900">{request.fullName}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{request.phone}</p>
                      <p className="text-xs text-zinc-500">{socialContact}</p>
                      <p className="mt-1 text-[10px] text-zinc-400 font-medium">
                        Gửi lúc: {request.createdAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div>
                    <StatusBadge status={request.status} />
                  </div>
                </div>

                {/* Request details */}
                <div className="bg-zinc-50 p-2.5 rounded text-xs space-y-2">
                  <div className="flex justify-between font-medium text-zinc-700">
                    <span>Kích thước: <strong className="text-zinc-900">{request.preferredSize ?? "-"}</strong></span>
                    <span>Màu sắc: <strong className="text-zinc-900">{request.preferredColor ?? "-"}</strong></span>
                  </div>
                  <div className="border-t border-zinc-200/60 pt-2">
                    <InquiryMessage message={request.customerMessage || ""} />
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <span className="text-xs text-zinc-500">Cập nhật trạng thái:</span>
                  <div className="flex items-center gap-2">
                    <AdminStatusSelect
                      endpoint={`/api/order-requests/${request.id}`}
                      statuses={statuses}
                      value={request.status}
                    />
                    <AdminInquiryDeleteButton
                      inquiryId={request.id}
                      customerName={request.fullName}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
