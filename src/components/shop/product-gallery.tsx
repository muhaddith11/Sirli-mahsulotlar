"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ProductImage } from "./product-image";

export function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="md:sticky md:top-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-cream-deep ring-1 ring-line">
        <ProductImage src={current} alt={name} loading="eager" className="aspect-square w-full" />
        {badge}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5" role="tablist" aria-label="Mahsulot rasmlari">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`${i + 1}-rasm`}
              onClick={() => setActive(i)}
              className={cn(
                "size-18 overflow-hidden rounded-2xl ring-2 transition sm:size-20",
                i === active ? "ring-berry-600" : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              <ProductImage src={src} alt="" className="size-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
