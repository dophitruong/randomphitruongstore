import Image from "next/image";
import { AdminStatusSelect } from "@/components/admin-status-select";
import { AdminTable } from "@/components/admin-table";
import { StatusBadge } from "@/components/status-badge";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statuses = ["NEW", "CONTACTED", "QUOTED", "CLOSED"];

export default async function AdminOrderRequestsPage() {
  const requests = await getPrisma().orderRequest.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-zinc-500">Custom sourcing</p>
        <h1 className="mt-2 text-4xl font-black">Order requests</h1>
      </header>
      <AdminTable
        headers={["Inspiration", "Customer", "Request", "Status", "Update"]}
      >
        {requests.map((request) => (
          <tr key={request.id}>
            <td className="px-4 py-4">
              <a href={request.inspirationUrl} rel="noreferrer" target="_blank">
                <Image
                  alt="Customer inspiration"
                  className="h-20 w-16 object-cover"
                  height={80}
                  src={request.inspirationUrl}
                  width={64}
                />
              </a>
            </td>
            <td className="px-4 py-4">
              <p className="font-bold">{request.fullName}</p>
              <p className="text-xs text-zinc-500">{request.phone}</p>
              <p className="text-xs text-zinc-500">{request.socialContact}</p>
            </td>
            <td className="max-w-xs px-4 py-4">
              <p>Size: {request.desiredSize}</p>
              <p>Color: {request.desiredColor}</p>
              <p className="mt-1 truncate text-xs text-zinc-500">
                {request.note || "-"}
              </p>
            </td>
            <td className="px-4 py-4">
              <StatusBadge status={request.status} />
            </td>
            <td className="px-4 py-4">
              <AdminStatusSelect
                endpoint={`/api/order-requests/${request.id}`}
                statuses={statuses}
                value={request.status}
              />
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
