"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Savatdagi son; o'zgarganda qisqa sakraydi */
export function CartBadge({ count, className }: { count: number; className?: string }) {
  const previous = useRef(count);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (count > previous.current) setBump((n) => n + 1);
    previous.current = count;
  }, [count]);

  if (count <= 0) return null;
  return (
    <span
      key={bump}
      className={cn(
        "grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-none text-white tabular ring-2 ring-surface",
        bump > 0 && "animate-bump",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
