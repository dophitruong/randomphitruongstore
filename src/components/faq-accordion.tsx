"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
              className="group flex w-full items-center justify-between gap-4 py-5 text-left font-bold text-zinc-900 transition-colors hover:text-[#a72b1f]"
              onClick={() => setActive(open ? null : index)}
              type="button"
            >
              {item.question}
              <FontAwesomeIcon
                icon={faChevronDown}
                className={cn(
                  "text-[16px] text-zinc-400 transition-all duration-300 ease-out shrink-0 translate-y-[-0.5px] group-hover:text-[#a72b1f]",
                  open ? "rotate-180 text-[#a72b1f]" : ""
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-5 text-sm leading-6 text-zinc-600">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
