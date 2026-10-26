"use client";

import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/** Qiymati o'zgarganda o'zi joylashgan formani yuboradigan select */
export function AutoSubmitSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <select
        {...props}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-9 appearance-none rounded-full border border-line-strong bg-surface pl-3.5 pr-8 text-sm font-medium text-ink outline-none transition-colors hover:border-ink-3 focus:border-brand"
      />
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
    </span>
  );
}
