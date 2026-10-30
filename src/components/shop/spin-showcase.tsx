"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsDown } from "lucide-react";
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

/** Mahsulot markazdan bir qadam o'tganda qo'shimcha burilishi (gradus) */
const TRAVEL_TURN = 150;
/** Har bir mahsulot o'z o'qi atrofida boshqalardan biroz farqli fazada aylanadi */
const PHASE = 47;
/** Vitrina surishdan qancha kechikib ergashadi (soniya) — qanchalik katta, shunchalik "suzuvchan" */
const FOLLOW = 0.12;

/**
 * "Eng ommabop" vitrinasi (agrumeafarm.it uslubida): sahifa pastga surilganda vitrina joyida
 * qotib turadi, mahsulotlar qizil gumbaz ustida yoy bo'ylab suzib o'tadi va o'tayotganda aylanadi.
 * Har bir mahsulot o'z o'qi atrofida doim aylanib turadi; doira-matn surish bilan buriladi.
 */
export function SpinShowcase({ items }: { items: ShowcaseItem[] }) {
  const { locale, t } = useI18n();
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const runway = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const visuals = useRef<(HTMLDivElement | null)[]>([]);
  const turns = useRef<number[]>([]);
  const details = useRef<number[]>([]);
  const count = items.length;
  const moving = count > 1;
  const current = items[active] ?? items[0];

  /** Joriy holat: 0 — birinchi mahsulot markazda, count-1 — oxirgisi */
  const progress = useCallback(() => {
    const el = runway.current;
    const sticky = card.current;
    const gap = spacer.current;
    if (!el || !sticky || !gap || !moving) return { position: 0, step: 0, stickyTop: 0 };
    const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
    const step = gap.offsetHeight / (count - 1);
    const position = Math.min(count - 1, Math.max(0, (stickyTop - el.getBoundingClientRect().top) / step));
    return { position, step, stickyTop };
  }, [count, moving]);

  const layout = useCallback((position: number) => {
    const width = card.current?.clientWidth ?? 0;
    visuals.current.forEach((visual, i) => {
      if (!visual) return;
      const offset = i - position;
      const d = Math.abs(offset);
      // Yoy: markazdagisi tepada va katta, qo'shnilari chetga, pastga egilib, kichrayib o'tadi
      const spread = width * (width < 768 ? 0.5 : 0.27);
      const y = Math.min(d, 2.2) ** 2 * 26;
      const scale = 1 - Math.min(d, 1) * 0.38 - Math.max(0, Math.min(d, 2.5) - 1) * 0.12;
      visual.style.transform = `translate(${offset * spread}px, ${y}px) rotate(${offset * 16}deg) scale(${scale})`;
      visual.style.filter = d > 0.02 ? `brightness(${1 - Math.min(d, 1) * 0.12})` : "";
      visual.style.zIndex = String(100 - Math.round(d * 10));
      visual.style.visibility = d > 2.6 ? "hidden" : "visible";
      turns.current[i] = -offset * TRAVEL_TURN;
      details.current[i] = scale;
    });
    if (ring.current) ring.current.style.transform = `rotate(${-position * 40}deg)`;
    const nearest = Math.round(position);
    setActive((prev) => (prev === nearest ? prev : nearest));
    setStarted((prev) => prev || position > 0.15);
  }, []);

  // Vitrina surishga yumshoq ergashadi: g'ildirak "zinapoyasi" ham silliq harakatga aylanadi
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let shown: number | null = null;
    let previous = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const target = progress().position;
      const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000));
      previous = now;
      const next = shown === null || reduced.matches ? target : shown + (target - shown) * (1 - Math.exp(-dt / FOLLOW));
      shown = Math.abs(target - next) < 0.001 ? target : next;
      layout(shown);
      frame = shown === target ? 0 : requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (frame) return;
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [layout, progress]);

  /** Kerakli mahsulot markazga kelguncha sahifani suradi */
  const goTo = (index: number) => {
    const el = runway.current;
    if (!el || !moving) return;
    const { step, stickyTop } = progress();
    const target = Math.min(count - 1, Math.max(0, index));
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - stickyTop + target * step + 1, behavior: "smooth" });
  };

  if (!current) return null;

  return (
    <div ref={runway} className="relative -mx-4 md:mx-0">
      <section
        ref={card}
        aria-roledescription="carousel"
        aria-labelledby="home-showcase"
        className={cn(
          "@container relative isolate overflow-hidden bg-cream md:rounded-[var(--radius-card)]",
          moving && "sticky top-14 md:top-28",
        )}
      >
        {/* Qizil gumbaz — mahsulot ostida va narx qatori ortida */}
        <div
          aria-hidden
          className="absolute -inset-x-[30%] bottom-0 top-[calc(2.75rem+36cqw)] -z-10 rounded-[50%_50%_0_0/34%_34%_0_0] bg-brand md:-inset-x-[6%] md:top-[calc(2.75rem+21cqw)] md:rounded-[50%_50%_0_0/46%_46%_0_0] lg:top-[calc(2.75rem+17cqw)]"
        />
        {/* Gumbaz ustidagi doira-matn: o'zi sekin aylanadi, surishda qo'shimcha buriladi */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[calc(2.75rem+31cqw)] -z-10 aspect-square w-[150cqw] -translate-x-1/2 md:top-[calc(2.75rem+18cqw)] md:w-[78cqw] lg:top-[calc(2.75rem+14.5cqw)] lg:w-[66cqw]"
        >
          <div ref={ring} className="size-full">
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
        </div>

        <div className="flex items-baseline justify-between px-4 pt-4 md:px-6 md:pt-5">
          <h2 id="home-showcase" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand">
            {t.home.showcaseTitle}
          </h2>
          {moving && (
            <span className="text-[13px] text-ink-2 tabular" aria-hidden>
              {active + 1} / {count}
            </span>
          )}
        </div>

        {/* Sahna: mahsulotlar markazdan yoy bo'ylab joylashadi (transform'lar layout() da) */}
        <div className="relative mt-2 h-[calc(56cqw+3.5rem)] md:h-[calc(30cqw+4rem)] lg:h-[calc(24cqw+4rem)]">
          {items.map((item, i) => (
            <div
              key={item.id}
              ref={(node) => {
                visuals.current[i] = node;
              }}
              aria-roledescription="slide"
              aria-label={fill(t.home.showcaseItem, { index: i + 1 })}
              aria-hidden={i !== active}
              className="absolute left-1/2 top-0 w-[56%] -translate-x-1/2 origin-[50%_85%] will-change-transform md:w-[30%] lg:w-[24%]"
            >
              <Link
                href={`/products/${item.slug}`}
                tabIndex={i === active ? 0 : -1}
                aria-label={item.name}
                onClick={(e) => {
                  if (i === active) return;
                  e.preventDefault();
                  goTo(i);
                }}
                className="block"
              >
                <div className={cn(i === active && "motion-safe:animate-float")}>
                  <SpinViewer
                    frames={item.frames}
                    label={fill(t.product.spinLabel, { name: item.name })}
                    interactive={false}
                    badge={false}
                    active={Math.abs(i - active) <= 2}
                    period={10}
                    turn={() => (turns.current[i] ?? 0) + i * PHASE}
                    detail={() => details.current[i] ?? 1}
                    className="aspect-square w-full"
                  />
                </div>
                <div
                  aria-hidden
                  className="mx-auto -mt-2 h-4 w-3/5 rounded-[50%] bg-[radial-gradient(closest-side,rgb(60_15_15/0.32),transparent)]"
                />
              </Link>
            </div>
          ))}

          {moving && (
            <>
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
                aria-label={t.home.showcasePrev}
                className="absolute left-4 top-1/3 z-[200] hidden size-11 place-items-center rounded-full bg-cream-soft text-ink transition-colors hover:bg-white disabled:opacity-40 md:grid"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                disabled={active === count - 1}
                aria-label={t.home.showcaseNext}
                className="absolute right-4 top-1/3 z-[200] hidden size-11 place-items-center rounded-full bg-cream-soft text-ink transition-colors hover:bg-white disabled:opacity-40 md:grid"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        <div className="relative z-[200] px-4 pb-4 text-cream-soft md:mx-auto md:max-w-xl md:px-6 md:pb-6 md:text-center">
          <Link href={`/products/${current.slug}`} className="block text-lg font-semibold leading-snug text-balance md:text-xl">
            {current.name}
          </Link>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 md:justify-center">
            <p className="text-left">
              <span className="block whitespace-nowrap text-2xl font-bold leading-none tabular">
                {formatPrice(current.price, locale)}
              </span>
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
          {moving && (
            <div className="mt-4 flex items-center justify-between md:justify-center md:gap-6">
              <div className="flex gap-1.5">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(i)}
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
              <span
                aria-hidden
                className={cn(
                  "flex items-center gap-1 text-xs font-medium uppercase tracking-[0.08em] text-cream-soft/80 transition-opacity duration-300",
                  started && "opacity-0",
                )}
              >
                <ChevronsDown className="size-4 motion-safe:animate-bounce" />
                {t.home.showcaseScroll}
              </span>
            </div>
          )}
        </div>
      </section>
      {/* Surish yo'lagi: har bir mahsulot uchun qo'shimcha balandlik */}
      {moving && (
        <div
          ref={spacer}
          aria-hidden
          style={{ "--steps": count - 1 } as React.CSSProperties}
          className="h-[calc(var(--steps)*15rem)] md:h-[calc(var(--steps)*19rem)]"
        />
      )}
    </div>
  );
}
