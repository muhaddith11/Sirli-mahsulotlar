import Link from "next/link";
import { cn } from "@/lib/cn";

/** Brend belgisi: qopqoqli emal kastryulka siluetı */
export function PotMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <path d="M9 9.5c1.6-2.6 4.2-3.8 7-3.8s5.4 1.2 7 3.8H9Z" fill="currentColor" />
      <rect x="14" y="3" width="4" height="3.4" rx="1.2" fill="currentColor" />
      <path d="M6.5 11.5h19v9.8c0 3.3-3.4 5.2-9.5 5.2s-9.5-1.9-9.5-5.2v-9.8Z" fill="currentColor" />
      <rect x="3" y="13" width="4.2" height="2.4" rx="1.2" fill="currentColor" />
      <rect x="24.8" y="13" width="4.2" height="2.4" rx="1.2" fill="currentColor" />
      <circle cx="13" cy="18" r="2.2" fill="#fff" />
      <circle cx="19" cy="20" r="1.6" fill="#fff" />
    </svg>
  );
}

export function Logo({ label, className }: { label: string; className?: string }) {
  return (
    <Link href="/" aria-label={label} className={cn("flex shrink-0 items-center gap-1.5 text-brand", className)}>
      <PotMark className="size-8" />
      <span className="text-[22px] font-extrabold leading-none tracking-[-0.03em]">sirli</span>
    </Link>
  );
}
