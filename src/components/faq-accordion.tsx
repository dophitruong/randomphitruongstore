"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FAQAccordion({
  items
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const [active, setActive] = useState<number | null>(0);

  return (
    <div className="border-t border-black">
      {items.map((item, index) => {
        const open = active === index;
        return (
          <div className="border-b border-black" key={item.question}>
            <button
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-5 text-left font-bold"
              onClick={() => setActive(open ? null : index)}
              type="button"
            >
              {item.question}
              <ChevronDown
                className={open ? "rotate-180" : ""}
                size={18}
              />
            </button>
            {open ? (
              <p className="max-w-3xl pb-5 text-sm leading-6 text-zinc-600">
                {item.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
