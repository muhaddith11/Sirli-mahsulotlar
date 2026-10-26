"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, LoaderCircle, Link2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/shop/product-image";

/** Mahsulot rasmlari: fayl yuklash yoki URL qo'shish, tartiblash, o'chirish */
export function ImageManager({ initial, error }: { initial: string[]; error?: string }) {
  const [images, setImages] = useState(initial);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          toast.error(data?.error ?? `${file.name} yuklanmadi`);
          continue;
        }
        setImages((prev) => [...prev, data.url as string]);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addUrl = () => {
    const value = url.trim();
    if (!/^(https?:\/\/|\/)/.test(value)) {
      toast.error("URL http(s):// yoki / bilan boshlanishi kerak");
      return;
    }
    setImages((prev) => [...prev, value]);
    setUrl("");
  };

  const makeMain = (index: number) =>
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);

  return (
    <div>
      {images.map((src, i) => (
        <input key={`${src}-${i}`} type="hidden" name="images" value={src} />
      ))}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-[var(--radius-field)] ring-1 ring-line">
            <ProductImage src={src} alt="" className="size-full" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Asosiy
              </span>
            )}
            <div className="absolute right-1.5 top-1.5 flex gap-1">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeMain(i)}
                  className="grid size-7 place-items-center rounded-md bg-surface/90 text-ink shadow"
                  title="Asosiy qilish"
                  aria-label="Asosiy rasm qilish"
                >
                  <ArrowLeft className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="grid size-7 place-items-center rounded-md bg-surface/90 text-brand shadow"
                title="O'chirish"
                aria-label="Rasmni o'chirish"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[var(--radius-field)] border-2 border-dashed border-line text-xs font-semibold text-ink-2 transition hover:border-brand/40 hover:text-brand",
            uploading && "opacity-60",
          )}
        >
          {uploading ? <LoaderCircle className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
          {uploading ? "Yuklanmoqda…" : "Rasm yuklash"}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple
        hidden
        onChange={(e) => upload(e.target.files)}
      />

      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="yoki rasm URL manzilini kiriting"
            className="h-10 w-full rounded-[var(--radius-field)] border border-line bg-surface pl-9 pr-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <button type="button" onClick={addUrl} className="h-10 rounded-[var(--radius-field)] bg-page px-4 text-sm font-bold hover:bg-line">
          Qo&apos;shish
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-semibold text-brand">{error}</p>}
    </div>
  );
}
