"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Film, LoaderCircle, Pipette, RefreshCw, Trash2 } from "lucide-react";
import { SpinViewer } from "@/components/shop/spin-viewer";
import { cn } from "@/lib/cn";
import {
  alphaBounds,
  findLoopEnd,
  frameDifference,
  frameTimes,
  guessBackdrop,
  removeBackdrop,
  SPIN_FRAME_COUNT,
  unionBounds,
  type Bounds,
  type Rgb,
} from "@/lib/spin";

/** Tayyor kadrning uzun tomoni (px) */
const OUTPUT_MAX = 800;
/** Ishlov berish o'lchami (px) */
const WORK_MAX = 1440;
const PREVIEW_MAX = 480;
const MAX_DURATION = 60;

type Settings = {
  start: number;
  end: number;
  cutout: boolean;
  key: Rgb;
  tolerance: number;
  cropTop: number;
  cropBottom: number;
  cropSides: number;
  reverse: boolean;
};

type Source = {
  video: HTMLVideoElement;
  url: string;
  duration: number;
  /** Aylanish oxiri avtomatik topildimi */
  detected: boolean;
};

type Phase = "idle" | "analyzing" | "ready" | "building" | "uploading";

type Rect = { sx: number; sy: number; sw: number; sh: number };

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("seeked", done);
      video.removeEventListener("error", fail);
    };
    const done = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error("seek"));
    };
    video.addEventListener("seeked", done);
    video.addEventListener("error", fail);
    video.currentTime = Math.min(Math.max(0, time), Math.max(0, video.duration - 0.05));
  });
}

function openVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const timer = window.setTimeout(() => reject(new Error("timeout")), 20000);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadeddata = () => {
      window.clearTimeout(timer);
      if (video.videoWidth > 0) resolve(video);
      else reject(new Error("decode"));
    };
    video.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("decode"));
    };
    video.src = URL.createObjectURL(file);
  });
}

function cropRect(video: HTMLVideoElement, s: Settings): Rect {
  const w = video.videoWidth;
  const h = video.videoHeight;
  return {
    sx: Math.round(w * s.cropSides),
    sy: Math.round(h * s.cropTop),
    sw: Math.max(8, Math.round(w * (1 - 2 * s.cropSides))),
    sh: Math.max(8, Math.round(h * (1 - s.cropTop - s.cropBottom))),
  };
}

/** Videoning joriy kadrini (kesilgan qismini) `maxSide` o'lchamda o'qiydi */
function grab(video: HTMLVideoElement, rect: Rect, maxSide: number): ImageData {
  const scale = Math.min(1, maxSide / Math.max(rect.sw, rect.sh));
  const width = Math.max(1, Math.round(rect.sw * scale));
  const height = Math.max(1, Math.round(rect.sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.drawImage(video, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}

/** Birinchi kadrga qaytgan joyni qidiradi — bitta to'liq aylanish oxiri */
async function detectLoop(video: HTMLVideoElement, onProgress: (value: number) => void): Promise<number | null> {
  const samples = Math.min(120, Math.max(24, Math.round(video.duration * 6)));
  const times = Array.from({ length: samples }, (_, i) => (i / (samples - 1)) * Math.max(0, video.duration - 0.05));
  const rect = { sx: 0, sy: 0, sw: video.videoWidth, sh: video.videoHeight };
  let first: Float32Array | null = null;
  const diffs: number[] = [];
  for (let i = 0; i < samples; i++) {
    await seek(video, times[i]);
    const { data } = grab(video, rect, 40);
    const gray = new Float32Array(data.length / 4);
    for (let p = 0; p < gray.length; p++) gray[p] = data[p * 4] * 0.299 + data[p * 4 + 1] * 0.587 + data[p * 4 + 2] * 0.114;
    first ??= gray;
    diffs.push(frameDifference(first, gray));
    onProgress((i + 1) / samples);
  }
  return findLoopEnd(diffs, times);
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), "image/webp", 0.82),
  );
}

/** 36 ta tayyor kadr: kesish → fonni olib tashlash → hamma kadrda bir xil chegaraga qirqish → WebP */
async function buildFrames(video: HTMLVideoElement, s: Settings, onProgress: (done: number) => void): Promise<Blob[]> {
  const times = frameTimes(s.start, s.end, SPIN_FRAME_COUNT);
  const rect = cropRect(video, s);

  // 1-o'tish (kichik o'lchamda): mahsulot butun aylanish davomida egallaydigan joy
  let crop: Bounds | null = null;
  if (s.cutout) {
    const list: (Bounds | null)[] = [];
    let size = { width: 1, height: 1 };
    for (let i = 0; i < times.length; i++) {
      await seek(video, times[i]);
      const image = grab(video, rect, 240);
      removeBackdrop(image.data, image.width, image.height, s.key, s.tolerance);
      list.push(alphaBounds(image.data, image.width, image.height));
      size = { width: image.width, height: image.height };
      onProgress((i + 1) * 0.3);
    }
    const union = unionBounds(list, size.width, size.height);
    if (!union) throw new Error("empty");
    // Ulushlarda saqlaymiz — 2-o'tish boshqa o'lchamda
    crop = { x0: union.x0 / size.width, y0: union.y0 / size.height, x1: union.x1 / size.width, y1: union.y1 / size.height };
  }

  const blobs: Blob[] = [];
  const out = document.createElement("canvas");
  for (let i = 0; i < times.length; i++) {
    await seek(video, times[i]);
    const image = grab(video, rect, WORK_MAX);
    if (s.cutout) removeBackdrop(image.data, image.width, image.height, s.key, s.tolerance);
    const area = crop
      ? {
          x: Math.floor(crop.x0 * image.width),
          y: Math.floor(crop.y0 * image.height),
          w: Math.ceil((crop.x1 - crop.x0) * image.width),
          h: Math.ceil((crop.y1 - crop.y0) * image.height),
        }
      : { x: 0, y: 0, w: image.width, h: image.height };
    const scale = Math.min(1, OUTPUT_MAX / Math.max(area.w, area.h));
    out.width = Math.round(area.w * scale);
    out.height = Math.round(area.h * scale);
    const work = document.createElement("canvas");
    work.width = image.width;
    work.height = image.height;
    work.getContext("2d")!.putImageData(image, 0, 0);
    const context = out.getContext("2d")!;
    context.clearRect(0, 0, out.width, out.height);
    context.imageSmoothingQuality = "high";
    context.drawImage(work, area.x, area.y, area.w, area.h, 0, 0, out.width, out.height);
    blobs.push(await toBlob(out));
    onProgress((s.cutout ? 0.3 * times.length : 0) + i + 1);
  }
  // Teskari yo'nalish: birinchi kadr joyida qoladi
  return s.reverse ? [blobs[0], ...blobs.slice(1).reverse()] : blobs;
}

async function uploadFrames(blobs: Blob[], onProgress: (done: number) => void): Promise<string[]> {
  const urls: string[] = new Array(blobs.length);
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < blobs.length) {
      const index = next++;
      const extension = blobs[index].type === "image/webp" ? "webp" : "png";
      const body = new FormData();
      body.append("file", new File([blobs[index]], `spin-${index}.${extension}`, { type: blobs[index].type }));
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.url) throw new Error(data?.error ?? "upload");
      urls[index] = data.url;
      onProgress(++done);
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  return urls;
}

const percentLabel = (value: number) => `${Math.round(value * 100)}%`;

export function SpinManager({ initial, initialCutout, error }: { initial: string[]; initialCutout: boolean; error?: string }) {
  const [frames, setFrames] = useState(initial);
  const [cutout, setCutout] = useState(initialCutout);
  const [source, setSource] = useState<Source | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const rawRef = useRef<ImageData | null>(null);
  const busy = phase === "analyzing" || phase === "building" || phase === "uploading";

  const update = (patch: Partial<Settings>) => setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  const discard = () => {
    if (source) URL.revokeObjectURL(source.url);
    setSource(null);
    setSettings(null);
    setPhase("idle");
    if (fileRef.current) fileRef.current.value = "";
  };

  const load = async (file: File | undefined) => {
    if (!file) return;
    discard();
    setPhase("analyzing");
    setProgress(0);
    try {
      const video = await openVideo(file);
      if (video.duration > MAX_DURATION) throw new Error("long");
      const end = await detectLoop(video, setProgress);
      await seek(video, 0);
      const first = grab(video, { sx: 0, sy: 0, sw: video.videoWidth, sh: video.videoHeight }, 240);
      setSource({ video, url: video.src, duration: video.duration, detected: end !== null });
      setSettings({
        start: 0,
        end: Math.round((end ?? video.duration) * 100) / 100,
        cutout: true,
        key: guessBackdrop(first.data, first.width, first.height),
        tolerance: 46,
        cropTop: 0,
        cropBottom: 0,
        cropSides: 0,
        reverse: false,
      });
      setPreviewIndex(0);
      setPhase("ready");
    } catch (e) {
      setPhase("idle");
      const reason = e instanceof Error ? e.message : "";
      toast.error(
        reason === "long"
          ? `Video ${MAX_DURATION} soniyadan qisqa bo'lsin`
          : "Videoni brauzer o'qiy olmadi. MP4 formatida yuklang (iPhone videosini Telegram orqali o'zingizga yuborib, qayta saqlasangiz bo'ladi).",
      );
    }
  };

  // Tanlangan kadrni sozlamalar bilan oldindan ko'rsatish
  useEffect(() => {
    if (!source || !settings || phase !== "ready") return;
    let stale = false;
    const timer = window.setTimeout(async () => {
      const time = frameTimes(settings.start, settings.end, SPIN_FRAME_COUNT)[previewIndex];
      await seek(source.video, time);
      if (stale) return;
      const image = grab(source.video, cropRect(source.video, settings), PREVIEW_MAX);
      rawRef.current = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
      if (settings.cutout) removeBackdrop(image.data, image.width, image.height, settings.key, settings.tolerance);
      const canvas = previewRef.current;
      if (!canvas) return;
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d")!.putImageData(image, 0, 0);
    }, 120);
    return () => {
      stale = true;
      window.clearTimeout(timer);
    };
  }, [source, settings, previewIndex, phase]);

  /** Ko'rinishda bosilgan joydagi rang — fon rangi */
  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const raw = rawRef.current;
    if (!raw || !settings?.cutout) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = Math.floor(((e.clientX - rect.left) / rect.width) * raw.width);
    const cy = Math.floor(((e.clientY - rect.top) / rect.height) * raw.height);
    const sum = [0, 0, 0];
    let n = 0;
    for (let y = cy - 2; y <= cy + 2; y++) {
      for (let x = cx - 2; x <= cx + 2; x++) {
        if (x < 0 || y < 0 || x >= raw.width || y >= raw.height) continue;
        const i = (y * raw.width + x) * 4;
        sum[0] += raw.data[i];
        sum[1] += raw.data[i + 1];
        sum[2] += raw.data[i + 2];
        n++;
      }
    }
    if (n) update({ key: [Math.round(sum[0] / n), Math.round(sum[1] / n), Math.round(sum[2] / n)] });
  };

  const build = async () => {
    if (!source || !settings) return;
    if (settings.end - settings.start < 1) {
      toast.error("Aylanish oralig'i kamida 1 soniya bo'lsin");
      return;
    }
    const total = SPIN_FRAME_COUNT * (settings.cutout ? 1.3 : 1);
    try {
      setPhase("building");
      setProgress(0);
      const blobs = await buildFrames(source.video, settings, (done) => setProgress(done / total));
      setPhase("uploading");
      setProgress(0);
      const urls = await uploadFrames(blobs, (done) => setProgress(done / blobs.length));
      setFrames(urls);
      setCutout(settings.cutout);
      discard();
      toast.success("360° kadrlar tayyor. O'zgarishlar «Saqlash» bosilganda yoziladi.");
    } catch (e) {
      setPhase("ready");
      const reason = e instanceof Error ? e.message : "";
      toast.error(
        reason === "empty"
          ? "Mahsulot topilmadi — butun kadr fon deb olindi. Sezgirlikni kamaytiring yoki fon rangini qayta tanlang."
          : reason && !["seek", "encode", "upload"].includes(reason)
            ? reason
            : "Kadrlarni tayyorlab bo'lmadi. Qayta urinib ko'ring.",
      );
    }
  };

  const hidden = (
    <>
      {frames.map((src, i) => (
        <input key={`${src}-${i}`} type="hidden" name="spinFrames" value={src} />
      ))}
      {cutout && frames.length > 0 && <input type="hidden" name="spinCutout" value="on" />}
    </>
  );

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept="video/*"
      hidden
      onChange={(e) => load(e.target.files?.[0])}
    />
  );

  if (phase === "analyzing") {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-field)] bg-page p-4 text-sm font-semibold text-ink-2">
        {hidden}
        <LoaderCircle className="size-5 animate-spin text-brand" />
        Video tahlil qilinmoqda — aylanish qayerda tugashini qidiryapmiz… {percentLabel(progress)}
      </div>
    );
  }

  if (source && settings) {
    const label = phase === "building" ? "Kadrlar tayyorlanmoqda" : "Yuklanmoqda";
    return (
      <div className="space-y-4">
        {hidden}
        {fileInput}
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <canvas
              ref={previewRef}
              onClick={pickColor}
              title={settings.cutout ? "Fon rangini tanlash uchun fonni bosing" : undefined}
              className={cn(
                "block max-h-80 w-full rounded-[var(--radius-field)] bg-[repeating-conic-gradient(var(--color-line)_0_25%,var(--color-surface)_0_50%)] bg-[length:16px_16px] object-contain ring-1 ring-line",
                settings.cutout && "cursor-crosshair",
              )}
            />
            <label className="mt-2 block text-xs font-semibold text-ink-2">
              Ko&apos;rish: {previewIndex * 10}°
              <input
                type="range"
                min={0}
                max={SPIN_FRAME_COUNT - 1}
                value={previewIndex}
                onChange={(e) => setPreviewIndex(Number(e.target.value))}
                disabled={busy}
                className="mt-1 block w-full accent-[var(--color-brand)]"
              />
            </label>
          </div>

          <div className="space-y-3 text-sm">
            <fieldset disabled={busy} className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-ink-2">Bitta to&apos;liq aylanish (soniya)</p>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={source.duration}
                    value={settings.start}
                    onChange={(e) => update({ start: Number(e.target.value) })}
                    className="h-9 w-20 rounded-[var(--radius-field)] border border-line bg-surface px-2 tabular"
                    aria-label="Boshlanishi"
                  />
                  <span className="text-ink-3">—</span>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={source.duration}
                    value={settings.end}
                    onChange={(e) => update({ end: Number(e.target.value) })}
                    className="h-9 w-20 rounded-[var(--radius-field)] border border-line bg-surface px-2 tabular"
                    aria-label="Tugashi"
                  />
                </div>
                <p className="mt-1 text-xs text-ink-3">
                  {source.detected
                    ? "Aylanish oxiri avtomatik topildi."
                    : "Aylanish oxiri topilmadi — butun video olindi. Kerak bo'lsa, qo'lda to'g'rilang."}{" "}
                  Video: {source.duration.toFixed(1)} s
                </p>
              </div>

              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={settings.cutout}
                  onChange={(e) => update({ cutout: e.target.checked })}
                  className="size-4 accent-[var(--color-brand)]"
                />
                Fonni olib tashlash
              </label>

              {settings.cutout && (
                <>
                  <div className="flex items-center gap-2 text-xs text-ink-2">
                    <span
                      className="size-6 rounded-md ring-1 ring-line"
                      style={{ backgroundColor: `rgb(${settings.key.join(" ")})` }}
                    />
                    <Pipette className="size-3.5" /> Fon rangi — o&apos;zgartirish uchun rasmda fonni bosing
                  </div>
                  <label className="block text-xs font-semibold text-ink-2">
                    Sezgirlik: {settings.tolerance}
                    <input
                      type="range"
                      min={10}
                      max={120}
                      value={settings.tolerance}
                      onChange={(e) => update({ tolerance: Number(e.target.value) })}
                      className="mt-1 block w-full accent-[var(--color-brand)]"
                    />
                  </label>
                </>
              )}

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["cropTop", "Tepadan"],
                    ["cropBottom", "Pastdan"],
                    ["cropSides", "Yonlardan"],
                  ] as const
                ).map(([field, title]) => (
                  <label key={field} className="block text-xs font-semibold text-ink-2">
                    {title}: {Math.round(settings[field] * 100)}%
                    <input
                      type="range"
                      min={0}
                      max={field === "cropSides" ? 0.35 : 0.45}
                      step={0.01}
                      value={settings[field]}
                      onChange={(e) => update({ [field]: Number(e.target.value) })}
                      className="mt-1 block w-full accent-[var(--color-brand)]"
                    />
                  </label>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-ink-2">
                <input
                  type="checkbox"
                  checked={settings.reverse}
                  onChange={(e) => update({ reverse: e.target.checked })}
                  className="size-4 accent-[var(--color-brand)]"
                />
                Teskari yo&apos;nalishda aylantirish
              </label>
            </fieldset>
          </div>
        </div>

        {busy ? (
          <div className="rounded-[var(--radius-field)] bg-page p-3">
            <div className="flex justify-between text-xs font-semibold text-ink-2">
              <span>{label}…</span>
              <span className="tabular">{percentLabel(progress)}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: percentLabel(progress) }} />
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={discard} className="h-10 flex-1 rounded-[var(--radius-field)] bg-page text-sm font-bold hover:bg-line">
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={build}
              className="h-10 flex-[2] rounded-[var(--radius-field)] bg-ink text-sm font-semibold text-white hover:bg-ink/90"
            >
              Tayyorlash va yuklash
            </button>
          </div>
        )}
      </div>
    );
  }

  if (frames.length > 0) {
    return (
      <div className="flex flex-wrap items-start gap-4">
        {hidden}
        {fileInput}
        <SpinViewer frames={frames} label="360° ko'rinish" hint="Suring" className="size-56 rounded-[var(--radius-field)] bg-cream" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold">{frames.length} ta kadr</p>
          <p className="max-w-56 text-xs text-ink-3">
            {cutout
              ? "Foni olib tashlangan — bosh sahifadagi «Eng ommabop» vitrinasiga ham chiqadi."
              : "Fon bilan — faqat mahsulot sahifasida ko'rinadi."}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-field)] bg-page px-3 text-xs font-bold hover:bg-line"
            >
              <RefreshCw className="size-3.5" /> Boshqa video
            </button>
            <button
              type="button"
              onClick={() => setFrames([])}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-field)] px-3 text-xs font-bold text-brand hover:bg-brand-soft"
            >
              <Trash2 className="size-3.5" /> O&apos;chirish
            </button>
          </div>
        </div>
        {error && <p className="w-full text-xs font-semibold text-brand">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {hidden}
      {fileInput}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-[var(--radius-field)] border-2 border-dashed border-line py-6 text-xs font-semibold text-ink-2 transition hover:border-brand/40 hover:text-brand"
      >
        <Film className="size-6" />
        Video yuklash
      </button>
      <ul className="mt-3 list-disc space-y-1 pl-4 text-xs leading-relaxed text-ink-3">
        <li>Telefon qimirlamasin (shtativ yoki kitoblar ustida), mahsulot kadrda to&apos;liq ko&apos;rinsin.</li>
        <li>Fon bir rangli va mahsulotdan ajralib tursin: oq emal uchun rangli qog&apos;oz; patnisni ham shu qog&apos;oz bilan yoping.</li>
        <li>Kunduzgi yorug&apos;lik, chaqnoqsiz. Bir marta to&apos;liq, sekin va bir tekis aylantiring.</li>
      </ul>
      {error && <p className="mt-1.5 text-xs font-semibold text-brand">{error}</p>}
    </div>
  );
}
