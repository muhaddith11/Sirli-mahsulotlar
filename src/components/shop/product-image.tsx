import { cn } from "@/lib/cn";
import { PotMark } from "./logo";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

/**
 * Mahsulot rasmi. URL'lar ixtiyoriy domendan bo'lishi mumkinligi uchun oddiy <img>.
 * Rasm bo'lmasa — brend belgisi bilan joy egallovchi.
 */
export function ProductImage({ src, alt, className, loading = "lazy" }: Props) {
  if (!src) {
    return (
      <div className={cn("grid place-items-center bg-cream text-line-strong", className)}>
        <PotMark className="size-1/3" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading={loading} decoding="async" className={cn("object-cover", className)} />;
}
