"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/i18n/config";
import { writeLocaleCookie } from "@/i18n/client";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

export function LanguageSwitch({ className, variant = "segmented" }: { className?: string; variant?: "segmented" | "toggle" }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (next: Locale) => {
    if (next === locale) return;
    writeLocaleCookie(next);
    startTransition(() => router.refresh());
  };

  if (variant === "toggle") {
    const other = LOCALES.find((code) => code !== locale) ?? locale;
    return (
      <button
        type="button"
        onClick={() => change(other)}
        aria-label={`${t.common.language}: ${other.toUpperCase()}`}
        className={cn(
          "grid h-9 w-10 shrink-0 place-items-center rounded-full bg-page text-xs font-semibold uppercase tracking-wide text-ink-2 transition-colors hover:text-ink",
          pending && "opacity-60",
          className,
        )}
      >
        {other}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn("inline-flex h-9 shrink-0 items-center rounded-full bg-page p-0.5", pending && "opacity-60", className)}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => change(code)}
          aria-pressed={code === locale}
          className={cn(
            "h-8 min-w-9 rounded-full px-2.5 text-xs font-semibold uppercase tracking-wide transition-colors",
            code === locale ? "bg-surface text-ink shadow-[0_1px_3px_rgb(31_27_24/0.14)]" : "text-ink-3 hover:text-ink",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
