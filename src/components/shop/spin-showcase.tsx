"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fill } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { CartControl } from "./cart-control";
import { SpinViewer } from "./spin-viewer";

export type ShowcaseItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  frames: string[];
};

/**
 * "Eng ommabop" vitrinasi: mahsulotlar qizil gumbaz ustida yoy bo'ylab turadi,
 * markazdagisi o'zi aylanadi. Surilganda chetdagilar kichrayib, yoy bo'ylab pastga egiladi.
 */
export function SpinShowcase({ items }: { items: ShowcaseItem[] }) {
  const { locale, t } = useI18n();
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const visuals = useRef<(HTMLDivElement | null)[]>([]);
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const current = items[active] ?? items[0];

  // Har bir mahsulotning markazdan uzoqligiga qarab — yoy bo'ylab joylashuv
  const layout = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Infinity;
    slides.current.forEach((slide, i) => {
      const visual = visuals.current[i];
      if (!slide || !visual) return;
      const offset = (slide.offsetLeft + slide.offsetWidth / 2 - center) / slide.offsetWidth;
      const distance = Math.abs(offset);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = i;
      }
      const d = Math.min(distance, 1.5);
      // Qo'shnilar markazga biroz tortiladi, kichrayib yoy bo'ylab pastga egiladi va xiralashadi
      const pull = -Math.sign(offset) * Math.min(distance, 2) * 0.3 * slide.offsetWidth;
      visual.style.transform = `translate(${pull}px, ${d * d * 34}px) rotate(${offset * 14}deg) scale(${1 - Math.min(d, 1) * 0.4})`;
      visual.style.filter = d > 0.02 ? `brightness(${1 - Math.min(d, 1) * 0.12})` : "";
    });
    if (ring.current) ring.current.style.transform = `rotate(${el.scrollLeft * -0.05}deg)`;
    setActive((prev) => (prev === nearest ? prev : nearest));
  }, []);

  useEffect(() => {
    layout();
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(onScroll);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [layout]);

  const scrollToIndex = (index: number) => {
    const el = track.current;
    const slide = slides.current[(index + items.length) % items.length];
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft + slide.offsetWidth / 2 - el.clientWidth / 2, behavior: "smooth" });
  };

  if (!current) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby="home-showcase"
      className="@container relative isolate overflow-hidden rounded-[var(--radius-card)] bg-cream"
    >
      {/* Qizil gumbaz — mahsulot ostida va narx qatori ortida */}
      <div
        aria-hidden
        className="absolute -inset-x-[30%] bottom-0 top-[calc(2.5rem+36cqw)] -z-10 rounded-[50%_50%_0_0/34%_34%_0_0] bg-brand md:-inset-x-[6%] md:top-[calc(2.5rem+21cqw)] md:rounded-[50%_50%_0_0/46%_46%_0_0] lg:top-[calc(2.5rem+17cqw)]"
      />
      {/* Gumbaz ustidagi doira-matn: o'zi sekin aylanadi, surganda qo'shimcha buriladi */}
      <div
        aria-hidden
        ref={ring}
        className="pointer-events-none absolute left-1/2 top-[calc(2.5rem+31cqw)] -z-10 aspect-square w-[150cqw] -translate-x-1/2 md:top-[calc(2.5rem+18cqw)] md:w-[78cqw] lg:top-[calc(2.5rem+14.5cqw)] lg:w-[66cqw]"
      >
        <svg viewBox="0 0 500 500" className="size-full motion-safe:animate-ring">
          <defs>
            <path id="showcase-ring" d="M250,250 m-218,0 a218,218 0 1,1 436,0 a218,218 0 1,1 -436,0" />
          </defs>
          {/* textLength = aylana uzunligi: matn chok qoldirmay butun aylanani egallaydi */}
          <text className="fill-cream-soft text-[21px] font-semibold" opacity={0.9}>
            <textPath href="#showcase-ring" textLength={1369} lengthAdjust="spacing">
              {t.home.showcaseRing}
            </textPath>
          </text>
        </svg>
      </div>

      <div className="flex items-baseline justify-between px-4 pt-4 md:px-6 md:pt-5">
        <h2 id="home-showcase" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand">
          {t.home.showcaseTitle}
        </h2>
        {items.length > 1 && (
          <span className="text-[13px] text-ink-2 tabular" aria-hidden>
            {active + 1} / {items.length}
          </span>
        )}
      </div>

      <div className="relative">
        <div
          ref={track}
          className="scrollbar-none relative -mb-16 flex snap-x snap-mandatory overflow-x-auto px-[22%] pb-[4.75rem] pt-2 md:px-[34%] lg:px-[37%]"
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              ref={(node) => {
                slides.current[i] = node;
              }}
              aria-roledescription="slide"
              aria-label={fill(t.home.showcaseItem, { index: i + 1 })}
              className="w-full shrink-0 snap-center"
            >
              <div
                ref={(node) => {
                  visuals.current[i] = node;
                }}
                className="origin-[50%_85%] will-change-transform"
              >
                <Link
                  href={`/products/${item.slug}`}
                  tabIndex={i === active ? 0 : -1}
                  aria-label={item.name}
                  onClick={(e) => {
                    if (i === active) return;
                    e.preventDefault();
                    scrollToIndex(i);
                  }}
                  className="block"
                >
                  <div className={cn(i === active && "motion-safe:animate-float")}>
                    <SpinViewer
                      frames={item.frames}
                      label={fill(t.product.spinLabel, { name: item.name })}
                      interactive={false}
                      badge={false}
                      active={i === active}
                      period={10}
                      className="aspect-square w-full"
                    />
                  </div>
                  <div
                    aria-hidden
                    className="mx-auto -mt-2 h-4 w-3/5 rounded-[50%] bg-[radial-gradient(closest-side,rgb(60_15_15/0.32),transparent)]"
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(active - 1)}
              aria-label={t.home.showcasePrev}
              className="absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-cream-soft text-ink transition-colors hover:bg-white md:grid"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(active + 1)}
              aria-label={t.home.showcaseNext}
              className="absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-cream-soft text-ink transition-colors hover:bg-white md:grid"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* Lenta pastidagi zaxira joy (yoydan tushgan qo'shnilar uchun) ustida — shuning uchun relative */}
      <div className="relative px-4 pb-4 text-cream-soft md:mx-auto md:max-w-xl md:px-6 md:pb-6 md:text-center">
        <Link href={`/products/${current.slug}`} className="block text-lg font-semibold leading-snug text-balance md:text-xl">
          {current.name}
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 md:justify-center">
          <p className="text-left">
            <span className="block whitespace-nowrap text-2xl font-bold leading-none tabular">{formatPrice(current.price, locale)}</span>
            {current.oldPrice != null && (
              <span className="mt-1 block text-sm text-cream-soft/75 line-through tabular">
                {formatPrice(current.oldPrice, locale)}
              </span>
            )}
          </p>
          <CartControl
            productId={current.id}
            productName={current.name}
            stock={current.stock}
            size="lg"
            tone="inverse"
            shortLabel
            className="w-36 shrink-0"
          />
        </div>
        {items.length > 1 && (
          <div className="mt-4 flex gap-1.5 md:justify-center">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={fill(t.home.showcaseItem, { index: i + 1 })}
                aria-current={i === active}
                className="grid h-6 place-items-center"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-200",
                    i === active ? "w-5 bg-cream-soft" : "w-1.5 bg-cream-soft/45",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
