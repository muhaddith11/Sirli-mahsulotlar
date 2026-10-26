"use client";

import { useRef, useState } from "react";
import { fill } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { ProductImage } from "./product-image";

export function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: React.ReactNode }) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const list = images.length > 0 ? images : [""];

  const goTo = (index: number) => {
    setActive(index);
    const el = track.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="md:sticky md:top-32 md:grid md:grid-cols-[64px_1fr] md:gap-3">
      {list.length > 1 && (
        <div className="hidden flex-col gap-2 md:flex" role="tablist" aria-label={t.product.photos}>
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={fill(t.product.photo, { index: i + 1 })}
              onClick={() => goTo(i)}
              className={cn(
                "overflow-hidden rounded-lg border-2 bg-cream transition-colors",
                i === active ? "border-brand" : "border-transparent hover:border-line-strong",
              )}
            >
              <ProductImage src={src} alt="" className="aspect-[4/5] w-full" />
            </button>
          ))}
        </div>
      )}

      <div className={cn("relative -mx-4 md:mx-0", list.length <= 1 && "md:col-span-2")}>
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.clientWidth);
            if (index !== active) setActive(index);
          }}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto bg-cream md:overflow-hidden md:rounded-[var(--radius-card)]"
        >
          {list.map((src, i) => (
            <ProductImage
              key={`${src}-${i}`}
              src={src}
              alt={i === 0 ? name : ""}
              loading={i === 0 ? "eager" : "lazy"}
              className="aspect-[4/5] w-full shrink-0 snap-center md:aspect-square"
            />
          ))}
        </div>
        {badge}
        {list.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden" aria-hidden>
            {list.map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 rounded-full transition-all duration-200", i === active ? "w-4 bg-ink" : "w-1.5 bg-ink/25")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
