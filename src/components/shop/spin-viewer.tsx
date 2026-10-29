"use client";

import { useEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { wrapFrame } from "@/lib/spin";

type Props = {
  frames: string[];
  label: string;
  /** O'zi sekin aylanib tursin */
  autoPlay?: boolean;
  /** Barmoq/sichqoncha bilan aylantirish */
  interactive?: boolean;
  /** false — faqat birinchi kadr yuklanadi va turadi (vitrinadagi chetki mahsulotlar) */
  active?: boolean;
  /** Burchakdagi "360°" belgisi (yuklanish foizi bilan) */
  badge?: boolean;
  /** "Aylantirish uchun suring" ishorasi (birinchi surishgacha ko'rinadi) */
  hint?: string;
  /** Bir to'liq aylanish, soniya */
  period?: number;
  /** Tashqaridan qo'shiladigan burilish (gradus) — masalan, vitrinada surish bilan birga aylanish */
  turn?: () => number;
  className?: string;
};

/** Ikki kadr orasidagi o'tish bosqichlari: bundan mayda farq qayta chizilmaydi */
const BLEND_STEPS = 32;

/** Avval siyrak kadrlar (har 4-, keyin har 2-), so'ng qolgani — aylanish tez "jonlanadi" */
function loadOrder(count: number): number[] {
  const order: number[] = [];
  for (const step of [4, 2, 1]) {
    for (let i = 0; i < count; i += step) if (!order.includes(i)) order.push(i);
  }
  return order;
}

/**
 * 360° ko'rinish: videodan olingan kadrlar canvas'da almashtiriladi.
 * Gorizontal surish aylantiradi, vertikal surish sahifani aylantiradi (touch-action: pan-y).
 */
export function SpinViewer({
  frames,
  label,
  autoPlay = true,
  interactive = true,
  active = true,
  badge = true,
  hint,
  period = 9,
  turn,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const key = frames.join("|");
  const [progress, setProgress] = useState({ key: "", count: 0 });
  const [touched, setTouched] = useState(false);
  const [degree, setDegree] = useState(0);
  const loaded = progress.key === key ? progress.count : 0;
  const count = frames.length;
  const ready = count > 0 && loaded >= count;

  // Animatsiya holati render'ga ta'sir qilmaydi — ref'larda
  const state = useRef({
    images: [] as HTMLImageElement[],
    requested: [] as boolean[],
    ok: [] as boolean[],
    position: 0,
    drawn: -1,
    velocity: 0,
    dragging: false,
    lastX: 0,
    lastTime: 0,
    idleUntil: 0,
    visible: true,
    play: false,
    turn: undefined as (() => number) | undefined,
    draw: () => {},
  });

  // Eng so'nggi turn funksiyasi rAF siklida o'qiladi
  useEffect(() => {
    state.current.turn = turn;
  });

  // Yangi kadrlar to'plami — holatni tozalash
  useEffect(() => {
    const s = state.current;
    s.images = [];
    s.requested = frames.map(() => false);
    s.ok = frames.map(() => false);
    s.position = 0;
    s.drawn = -1;
    return () => {
      for (const image of s.images) if (image) image.onload = null;
    };
  }, [frames]);

  // Faol bo'lsa hamma kadrlar, aks holda faqat birinchisi yuklanadi
  useEffect(() => {
    const s = state.current;
    for (const index of active ? loadOrder(frames.length) : [0]) {
      if (s.requested[index]) continue;
      s.requested[index] = true;
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (s.images[index] !== image) return;
        s.ok[index] = true;
        s.draw();
        setProgress((prev) => ({
          key,
          count: (prev.key === key ? prev.count : 0) + 1,
        }));
      };
      image.src = frames[index];
      s.images[index] = image;
    }
  }, [frames, key, active]);

  // Chizish, o'lcham, ko'rinish va aylanish sikli
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || count === 0) return;
    const s = state.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const nearestLoaded = (index: number) => {
      if (s.ok[index]) return index;
      for (let k = 1; k < count; k++) {
        const a = wrapFrame(index + k, count);
        const b = wrapFrame(index - k, count);
        if (s.ok[b]) return b;
        if (s.ok[a]) return a;
      }
      return -1;
    };

    const paint = (index: number, alpha: number) => {
      const image = s.images[index];
      const { width, height } = canvas;
      const scale = Math.min(
        width / image.naturalWidth,
        height / image.naturalHeight,
      );
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      context.globalAlpha = alpha;
      context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
    };

    s.draw = () => {
      const extra = s.turn ? (s.turn() / 360) * count : 0;
      const exact = s.position + extra;
      const base = Math.floor(exact);
      const from = nearestLoaded(wrapFrame(base, count));
      if (from < 0) return;
      const next = nearestLoaded(wrapFrame(base + 1, count));
      // Kadrlar orasidagi ulush: ikki qo'shni kadr aralashtiriladi — aylanish sakrab emas, silliq bo'ladi
      const mix = next === from ? 0 : Math.round((exact - base) * BLEND_STEPS) / BLEND_STEPS;
      const key = (from * count + next) * (BLEND_STEPS + 1) + mix * BLEND_STEPS;
      if (key === s.drawn) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingQuality = "high";
      if (mix === 0 || mix === 1) {
        paint(mix === 1 ? next : from, 1);
      } else {
        // "lighter" alfa bilan qo'shadi: shaffof chetlar xiralashmaydi, mahsulot to'liq ko'rinadi
        context.globalCompositeOperation = "lighter";
        paint(from, 1 - mix);
        paint(next, mix);
        context.globalCompositeOperation = "source-over";
      }
      context.globalAlpha = 1;
      s.drawn = key;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      s.drawn = -1;
      s.draw();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting;
    });
    intersection.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      if (!s.dragging) {
        if (Math.abs(s.velocity) > 0.4) {
          s.position += s.velocity * dt;
          s.velocity *= Math.pow(0.05, dt); // inersiya ~1 soniyada so'nadi
        } else if (
          s.play &&
          s.visible &&
          !reduced.matches &&
          now > s.idleUntil &&
          !document.hidden
        ) {
          s.position += (count / period) * dt;
        }
      }
      s.draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      s.draw = () => {};
    };
  }, [count, period]);

  // Hammasi yuklangach o'zi aylanadi
  useEffect(() => {
    // Siyrak kadrlar (chorak qismi) kelishi bilan aylana boshlaydi — qolganlari yo'l-yo'lakay yuklanadi
    state.current.play = autoPlay && active && loaded >= Math.ceil(count / 4);
    if (!active) {
      state.current.position = 0;
      state.current.velocity = 0;
    }
  }, [autoPlay, active, loaded, count]);

  const percent = count ? Math.round((loaded / count) * 100) : 0;
  const reportDegree = () =>
    setDegree(
      Math.round((wrapFrame(state.current.position, count) / count) * 360),
    );

  const pointer = interactive
    ? {
        onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => {
          const s = state.current;
          e.currentTarget.setPointerCapture(e.pointerId);
          s.dragging = true;
          s.velocity = 0;
          s.lastX = e.clientX;
          s.lastTime = performance.now();
          setTouched(true);
        },
        onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => {
          const s = state.current;
          if (!s.dragging) return;
          const now = performance.now();
          const width = e.currentTarget.clientWidth || 1;
          // Kenglik bo'ylab to'liq surish — bitta to'liq aylanish
          const delta = (-(e.clientX - s.lastX) / width) * count;
          const dt = Math.max(0.001, (now - s.lastTime) / 1000);
          s.position += delta;
          s.velocity = s.velocity * 0.5 + (delta / dt) * 0.5;
          s.lastX = e.clientX;
          s.lastTime = now;
        },
        onPointerUp: () => {
          const s = state.current;
          s.dragging = false;
          // Barmoq to'xtab qo'yib yuborilsa, inersiya bo'lmasin
          if (performance.now() - s.lastTime > 80) s.velocity = 0;
          s.idleUntil = performance.now() + 2500;
          reportDegree();
        },
        onPointerCancel: () => {
          state.current.dragging = false;
          state.current.idleUntil = performance.now() + 2500;
        },
        onKeyDown: (e: React.KeyboardEvent<HTMLCanvasElement>) => {
          const step =
            e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          const s = state.current;
          s.position = Math.round(s.position) + step;
          s.velocity = 0;
          s.idleUntil = performance.now() + 4000;
          setTouched(true);
          reportDegree();
        },
      }
    : {};

  return (
    <div className={className}>
      <div className="relative size-full">
        <canvas
          ref={canvasRef}
          {...pointer}
          {...(interactive
            ? {
                role: "slider",
                tabIndex: 0,
                "aria-valuemin": 0,
                "aria-valuemax": 359,
                "aria-valuenow": degree,
                "aria-valuetext": `${degree}°`,
              }
            : { role: "img" })}
          aria-label={label}
          className={cn(
            "block size-full select-none",
            interactive && "cursor-grab touch-pan-y active:cursor-grabbing",
          )}
        />
        {badge && (
          <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-surface/90 px-2 py-1 text-xs font-bold text-ink tabular">
            {ready ? "360°" : `360° · ${percent}%`}
          </span>
        )}
        {interactive && hint && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1.5 text-xs font-medium text-white transition-opacity duration-300",
              ready && !touched ? "opacity-100" : "opacity-0",
            )}
          >
            <MoveHorizontal className="size-3.5" />
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
