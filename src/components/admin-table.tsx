export function AdminTable({
  headers,
  children
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-zinc-200 bg-white">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-zinc-100 text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            {headers.map((header) => (
              <th className="px-4 py-3" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">{children}</tbody>
      </table>
    </div>
  );
}
