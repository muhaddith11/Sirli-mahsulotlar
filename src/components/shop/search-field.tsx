"use client";

import { Search } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

/** Sarlavhadagi qidiruv: oddiy GET forma — JavaScript'siz ham ishlaydi */
export function SearchField({
  className,
  size = "md",
  defaultValue,
}: {
  className?: string;
  size?: "md" | "lg";
  defaultValue?: string;
}) {
  const { t } = useI18n();

  return (
    <form action="/products" role="search" className={cn("relative flex min-w-0", className)}>
      <input
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={t.nav.searchPlaceholder}
        aria-label={t.nav.search}
        enterKeyHint="search"
        className={cn(
          "w-full min-w-0 rounded-[var(--radius-field)] border border-line-strong bg-surface pl-3.5 pr-12 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-3 focus:border-brand focus:ring-3 focus:ring-brand/15",
          size === "lg" ? "h-11" : "h-10",
        )}
      />
      <button
        type="submit"
        aria-label={t.nav.search}
        className={cn(
          "absolute right-1 top-1 grid place-items-center rounded-[8px] text-ink-2 transition-colors hover:bg-page hover:text-ink",
          size === "lg" ? "h-9 w-10" : "h-8 w-9",
        )}
      >
        <Search className="size-[18px]" strokeWidth={2} />
      </button>
    </form>
  );
}
