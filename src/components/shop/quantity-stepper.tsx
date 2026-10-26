"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
  size?: "sm" | "md";
};

export function QuantityStepper({ value, onChange, min = 1, max, disabled, size = "md" }: Props) {
  const button = cn(
    "grid place-items-center rounded-full text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35",
    size === "sm" ? "size-8" : "size-10",
  );
  return (
    <div className={cn("inline-flex items-center rounded-full bg-cream-deep p-1", disabled && "opacity-60")}>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Kamaytirish"
      >
        <Minus className="size-4" />
      </button>
      <span
        className={cn("text-center font-bold tabular-nums", size === "sm" ? "w-7 text-sm" : "w-9")}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Ko'paytirish"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
