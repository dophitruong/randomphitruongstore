"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface ValueItem {
  num: string;
  title: string;
  body: string;
}

export function BrandValues({ items }: { items: ValueItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileOpenIndexes, setMobileOpenIndexes] = useState<Record<number, boolean>>({
    0: true // Default open the first one
  });

  const toggleMobileIndex = (index: number) => {
    setMobileOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="mt-12">
      {/* ── Desktop Layout: Interactive Split Screen ── */}
      <div className="hidden lg:grid grid-cols-[1fr_1.2fr] gap-12 items-stretch min-h-[32rem]">
        {/* Left Column: Numbered Navigation Stack */}
        <div className="flex flex-col justify-between border-r border-black/10 pr-8 py-2">
          <div className="space-y-4">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className="w-full text-left group flex items-start gap-5 py-4 transition-all duration-300 outline-none cursor-pointer"
                >
                  <span
                    className={cn(
                      "font-jp text-lg font-black tracking-wider transition-colors duration-300",
                      isActive ? "text-[#a72b1f]" : "text-black/25 group-hover:text-black/60"
                    )}
                  >
                    {item.num}
                  </span>
                  <div className="flex-1">
                    <h3
                      className={cn(
                        "text-lg font-black uppercase tracking-wider transition-all duration-300",
                        isActive
                          ? "text-black translate-x-2"
                          : "text-zinc-500 group-hover:text-black"
                      )}
                    >
                      {item.title}
                    </h3>
                    <div
                      className={cn(
                        "h-[2px] mt-2 bg-[#a72b1f] origin-left transition-transform duration-300",
                        isActive ? "scale-x-100" : "scale-x-0"
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 mt-8">
            * Di chuyển chuột để xem nhanh
          </div>
        </div>

        {/* Right Column: Display Card with Fade Animation */}
        <div className="relative flex items-center">
          <div className="absolute inset-0 bg-[#e5e0d6]/20 border border-black/10" />
          <div className="relative w-full p-10 z-10 flex flex-col justify-center min-h-[24rem]">
            <span className="font-jp text-7xl font-black text-black/5 select-none absolute top-4 right-6">
              {items[activeIndex].num}
            </span>
            <p className="eyebrow text-[#a72b1f] mb-3">Quy trình · {items[activeIndex].num}</p>
            <h4 className="text-2xl font-black text-zinc-900 uppercase tracking-tight border-b border-black/10 pb-4">
              {items[activeIndex].title}
            </h4>
            <p className="mt-6 text-base text-zinc-600 leading-8 animate-fade-in transition-all duration-300">
              {items[activeIndex].body}
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile Layout: Elegant Accordion Stack ── */}
      <div className="lg:hidden space-y-4">
        {items.map((item, index) => {
          const isOpen = !!mobileOpenIndexes[index];
          return (
            <div
              key={index}
              className={cn(
                "border border-black/10 transition-all duration-300 bg-white",
                isOpen ? "shadow-md ring-1 ring-black/5" : "hover:border-zinc-400"
              )}
            >
              <button
                onClick={() => toggleMobileIndex(index)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors"
                type="button"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "font-jp text-sm font-black",
                      isOpen ? "text-[#a72b1f]" : "text-black/35"
                    )}
                  >
                    {item.num}
                  </span>
                  <h3
                    className={cn(
                      "text-sm font-black uppercase tracking-wider",
                      isOpen ? "text-[#a72b1f]" : "text-zinc-800"
                    )}
                  >
                    {item.title}
                  </h3>
                </div>
                <ChevronDown
                  className={cn(
                    "size-5 text-zinc-500 transition-transform duration-300",
                    isOpen ? "rotate-180 text-[#a72b1f]" : ""
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out overflow-hidden border-t border-black/5 bg-zinc-50/50",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="p-5 text-sm text-zinc-600 leading-7">
                    {item.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
