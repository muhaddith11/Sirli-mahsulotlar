import Link from "next/link";
import { cn } from "@/lib/cn";

export function PotMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <path d="M9 9.5c1.6-2.6 4.2-3.8 7-3.8s5.4 1.2 7 3.8H9Z" fill="currentColor" />
      <rect x="14" y="3" width="4" height="3.4" rx="1.2" fill="currentColor" />
      <path
        d="M6.5 11.5h19v9.8c0 3.3-3.4 5.2-9.5 5.2s-9.5-1.9-9.5-5.2v-9.8Z"
        fill="currentColor"
        fillOpacity=".92"
      />
      <rect x="3" y="13" width="4.2" height="2.4" rx="1.2" fill="currentColor" />
      <rect x="24.8" y="13" width="4.2" height="2.4" rx="1.2" fill="currentColor" />
      <circle cx="13" cy="18" r="2.2" fill="#fbf6ee" />
      <circle cx="19" cy="20" r="1.6" fill="#fbf6ee" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="Sirli Mahsulotlar — bosh sahifa">
      <span className="grid size-10 place-items-center rounded-2xl bg-berry-600 text-cream shadow-[inset_0_-3px_0_rgba(0,0,0,0.15)]">
        <PotMark className="size-6" />
      </span>
      <span className="leading-none">
        <span className="font-display text-xl font-semibold italic tracking-tight text-ink">Sirli</span>
        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
          mahsulotlar
        </span>
      </span>
    </Link>
  );
}
