"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, LoaderCircle } from "lucide-react";
import { adjustStockAction, setStockAction } from "@/actions/admin/inventory";
import { cn } from "@/lib/cn";

/** Ombor jadvalidagi qoldiqni tez o'zgartirish: −1 / +1 / +10 yoki aniq son */
export function StockEditor({ productId, stock }: { productId: string; stock: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(stock));
  const [saved, setSaved] = useState(stock);
  const [pending, startTransition] = useTransition();
  const dirty = value !== String(saved);

  const apply = (action: () => ReturnType<typeof setStockAction>) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setSaved(result.stock);
        setValue(String(result.stock));
        router.refresh();
      } else {
        toast.error(result.error);
        setValue(String(saved));
      }
    });

  const save = () => {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 0) {
      toast.error("Butun son kiriting");
      return;
    }
    apply(() => setStockAction(productId, next));
  };

  const quick = "h-9 rounded-lg px-2.5 text-xs font-bold ring-1 ring-line transition hover:bg-cream-deep disabled:opacity-40";

  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className={quick} disabled={pending || saved <= 0} onClick={() => apply(() => adjustStockAction(productId, -1))}>
        −1
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="relative"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
          onBlur={() => dirty && save()}
          inputMode="numeric"
          aria-label="Qoldiq"
          className={cn(
            "h-9 w-20 rounded-lg border bg-white px-2 text-center text-sm font-bold tabular-nums outline-none",
            dirty ? "border-berry-500" : "border-line",
          )}
        />
        {pending && <LoaderCircle className="absolute -right-5 top-2.5 size-4 animate-spin text-ink-faint" />}
        {!pending && dirty && (
          <button type="submit" className="absolute -right-6 top-2 text-leaf-600" aria-label="Saqlash">
            <Check className="size-5" />
          </button>
        )}
      </form>
      <span className="w-2" />
      <button type="button" className={quick} disabled={pending} onClick={() => apply(() => adjustStockAction(productId, 1))}>
        +1
      </button>
      <button type="button" className={quick} disabled={pending} onClick={() => apply(() => adjustStockAction(productId, 10))}>
        +10
      </button>
    </div>
  );
}
