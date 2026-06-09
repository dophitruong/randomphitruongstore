"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images
}: {
  images: Array<{ url: string; alt: string }>;
}) {
  const [active, setActive] = useState(0);
  const selected = images[active];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-200">
        {selected ? (
          <Image
            alt={selected.alt}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            src={selected.url}
          />
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              aria-label={`View image ${index + 1}`}
              className={`relative aspect-square overflow-hidden border ${
                active === index ? "border-black" : "border-transparent"
              }`}
              key={`${image.url}-${index}`}
              onClick={() => setActive(index)}
              type="button"
            >
              <Image
                alt={image.alt}
                className="object-cover"
                fill
                sizes="120px"
                src={image.url}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
