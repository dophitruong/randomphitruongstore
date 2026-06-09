import { Globe2 } from "lucide-react";

export function InternationalShippingNotice({
  title,
  body
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="border border-zinc-300 bg-zinc-100 p-4">
      <div className="flex gap-3">
        <Globe2 className="mt-0.5 shrink-0" size={18} />
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">{body}</p>
        </div>
      </div>
    </div>
  );
}
