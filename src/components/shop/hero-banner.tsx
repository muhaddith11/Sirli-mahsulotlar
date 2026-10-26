import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative mt-4 overflow-hidden rounded-[2rem] bg-berry-700 text-cream sm:mt-6">
      {/* Fon bezagi: emal idishlardagi nuqtali naqsh */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #fbf6ee 1.5px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-berry-500/50 blur-3xl" />

      <div className="relative grid items-center gap-6 px-6 pb-0 pt-8 sm:px-10 sm:pt-12 md:grid-cols-[1.1fr_1fr] md:pb-12">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="size-3.5" /> Yangi kolleksiya
          </span>
          <h1 className="mt-4 font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Oshxonangizga <em className="text-honey-500">bahor</em> ranglarini olib kiring
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cream/80">
            Gulli naqshlar bilan bezatilgan emal kastryulkalar, choynaklar va to&apos;plamlar. Toshkent bo&apos;ylab 1–2 kunda
            yetkazib beramiz.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-cream px-6 text-sm font-bold text-berry-700 transition hover:bg-white"
            >
              Katalogni ko&apos;rish <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/products?discounted=1"
              className="inline-flex h-12 items-center rounded-full px-5 text-sm font-bold text-cream ring-1 ring-cream/40 transition hover:bg-cream/10"
            >
              Chegirmalar
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm md:max-w-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/products/set-poppy.svg"
            alt="Ko'knori naqshli emal kastryulkalar to'plami"
            className="aspect-square w-full rounded-t-[2rem] object-cover md:rounded-[2rem]"
          />
          <div className="absolute -left-2 bottom-6 hidden items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 text-ink shadow-xl sm:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/products/kettle-rose.svg" alt="" className="size-14 rounded-xl" />
            <div>
              <p className="text-xs font-semibold text-ink-soft">Yangi kelgan</p>
              <p className="text-sm font-extrabold">Choynak &quot;Atirgul&quot;</p>
            </div>
          </div>
          <div className="absolute right-3 top-3 grid size-20 rotate-12 place-items-center rounded-full bg-honey-500 text-center text-berry-800 shadow-lg">
            <span className="text-[11px] font-black leading-tight">
              Sovg&apos;abop
              <br />
              to&apos;plamlar
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
