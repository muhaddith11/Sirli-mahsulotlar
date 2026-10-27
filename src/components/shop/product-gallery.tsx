"use client";

import { useRef, useState } from "react";
import { fill } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { ProductImage } from "./product-image";
import { SpinViewer } from "./spin-viewer";

type Props = {
  images: string[];
  name: string;
  badge?: React.ReactNode;
  /** 360° kadrlar — bo'lsa, galereya aylanayotgan ko'rinishdan boshlanadi */
  spinFrames?: string[];
};

export function ProductGallery({ images, name, badge, spinFrames = [] }: Props) {
  const { t } = useI18n();
  // Bitta kadr — aylanish emas (vitrina uchun shaffof rasm)
  const hasSpin = spinFrames.length > 1;
  const [mode, setMode] = useState<"spin" | "photos">(hasSpin ? "spin" : "photos");
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const list = images.length > 0 ? images : [""];
  const spinning = hasSpin && mode === "spin";
  const showThumbs = list.length > 1 || hasSpin;

  const goTo = (index: number) => {
    setMode("photos");
    setActive(index);
    const el = track.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="md:sticky md:top-32 md:grid md:grid-cols-[64px_1fr] md:gap-3">
      {showThumbs && (
        <div className="hidden flex-col gap-2 md:flex" role="tablist" aria-label={t.product.photos}>
          {hasSpin && (
            <button
              type="button"
              role="tab"
              aria-selected={spinning}
              onClick={() => setMode("spin")}
              className={cn(
                "grid aspect-[4/5] place-items-center rounded-lg border-2 bg-cream text-sm font-bold text-ink transition-colors",
                spinning ? "border-brand" : "border-transparent hover:border-line-strong",
              )}
            >
              {t.product.spinTab}
            </button>
          )}
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={!spinning && i === active}
              aria-label={fill(t.product.photo, { index: i + 1 })}
              onClick={() => goTo(i)}
              className={cn(
                "overflow-hidden rounded-lg border-2 bg-cream transition-colors",
                !spinning && i === active ? "border-brand" : "border-transparent hover:border-line-strong",
              )}
            >
              <ProductImage src={src} alt="" className="aspect-[4/5] w-full" />
            </button>
          ))}
        </div>
      )}

      <div className={cn("relative -mx-4 md:mx-0", !showThumbs && "md:col-span-2")}>
        <div
          ref={track}
          aria-hidden={spinning}
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
              alt={i === 0 && !hasSpin ? name : ""}
              loading={i === 0 ? "eager" : "lazy"}
              className="aspect-[4/5] w-full shrink-0 snap-center md:aspect-square"
            />
          ))}
        </div>

        {spinning && (
          <SpinViewer
            frames={spinFrames}
            label={fill(t.product.spinLabel, { name })}
            hint={t.product.spinHint}
            badge={false}
            className="absolute inset-0 bg-cream md:rounded-[var(--radius-card)]"
          />
        )}

        {badge}

        {hasSpin && images.length > 0 && (
          <div
            role="tablist"
            aria-label={t.product.photos}
            className="absolute right-4 top-3 flex rounded-full bg-surface/90 p-0.5 text-xs font-semibold md:hidden"
          >
            {(["spin", "photos"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "h-7 rounded-full px-3 transition-colors duration-200",
                  mode === value ? "bg-ink text-white" : "text-ink-2",
                )}
              >
                {value === "spin" ? t.product.spinTab : t.product.photosTab}
              </button>
            ))}
          </div>
        )}

        {!spinning && list.length > 1 && (
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
