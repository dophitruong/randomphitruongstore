import { Landmark, QrCode } from "lucide-react";
import { BANK_DETAILS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export function BankTransferBox({
  title,
  instruction,
  amount,
  orderNumber
}: {
  title: string;
  instruction: string;
  amount?: number;
  orderNumber?: string;
}) {
  return (
    <div className="border border-black bg-white p-5">
      <div className="flex items-center gap-2">
        <Landmark size={18} />
        <h3 className="font-bold">{title}</h3>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wider text-zinc-500">Bank</dt>
          <dd className="mt-1 font-bold">{BANK_DETAILS.bank}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Account number
          </dt>
          <dd className="mt-1 font-bold">{BANK_DETAILS.accountNumber}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-zinc-500">
            Account holder
          </dt>
          <dd className="mt-1 font-bold">{BANK_DETAILS.accountHolder}</dd>
        </div>
        {amount ? (
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Amount
            </dt>
            <dd className="mt-1 font-bold">{formatPrice(amount)}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-5 grid gap-4 sm:grid-cols-[140px_1fr]">
        <div className="flex aspect-square items-center justify-center border border-dashed border-zinc-400 bg-zinc-50">
          <div className="text-center text-zinc-500">
            <QrCode className="mx-auto" size={42} />
            <span className="mt-2 block text-[10px] font-bold uppercase tracking-wider">
              VietQR placeholder
            </span>
          </div>
        </div>
        <div className="text-xs leading-5 text-zinc-600">
          {orderNumber ? (
            <p className="mb-2 font-bold text-black">
              Transfer content: {orderNumber}
            </p>
          ) : null}
          <p>{instruction}</p>
        </div>
      </div>
    </div>
  );
}
