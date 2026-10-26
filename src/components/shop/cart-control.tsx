"use client";

import { LoaderCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import { fill } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { useCart } from "@/providers/cart-provider";

type Props = {
  productId: string;
  productName: string;
  stock: number;
  size?: "sm" | "lg";
  className?: string;
};

/**
 * "Savatga" tugmasi. Mahsulot savatga tushgach, o'sha joyning o'zida
 * "− 1 +" miqdor tanlagichiga aylanadi (asosiy interaksiya).
 */
export function CartControl({ productId, productName, stock, size = "sm", className }: Props) {
  const { t } = useI18n();
  const { quantityOf, addItem, updateQuantity, isPending } = useCart();
  const quantity = quantityOf(productId);
  const pending = isPending(productId);
  const soldOut = stock <= 0;
  const inCart = quantity > 0;

  const height = size === "lg" ? "h-12" : "h-9";
  const text = size === "lg" ? "text-[15px]" : "text-sm";

  return (
    <div className={cn("relative", height, className)}>
      {/* Savatga tugmasi */}
      <button
        type="button"
        onClick={() => addItem(productId)}
        disabled={soldOut || pending}
        tabIndex={inCart ? -1 : 0}
        aria-hidden={inCart}
        aria-label={soldOut ? `${productName} — ${t.card.soldOut}` : fill(t.card.addToCartLabel, { name: productName })}
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-1.5 rounded-[var(--radius-field)] font-semibold transition-[opacity,transform,background-color] duration-200 ease-[var(--ease-out)]",
          text,
          soldOut
            ? "cursor-not-allowed border border-line-strong text-ink-3"
            : "bg-brand text-white hover:bg-brand-hover active:scale-[0.98] active:bg-brand-press",
          inCart && "pointer-events-none scale-95 opacity-0",
        )}
      >
        {pending && !inCart ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          !soldOut && <ShoppingCart className={size === "lg" ? "size-5" : "size-4"} strokeWidth={2} />
        )}
        {soldOut ? t.card.soldOut : size === "lg" ? t.product.addToCart : t.card.addToCart}
      </button>

      {/* Miqdor tanlagich */}
      <div
        aria-hidden={!inCart}
        className={cn(
          "absolute inset-0 flex items-center justify-between rounded-[var(--radius-field)] bg-brand-soft text-brand transition-[opacity,transform] duration-200 ease-[var(--ease-out)]",
          inCart ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <button
          type="button"
          tabIndex={inCart ? 0 : -1}
          onClick={() => updateQuantity(productId, quantity - 1)}
          disabled={pending}
          aria-label={t.card.decrease}
          className={cn("grid h-full place-items-center rounded-l-[var(--radius-field)] hover:bg-brand/10", size === "lg" ? "w-12" : "w-9")}
        >
          <Minus className="size-4" strokeWidth={2.5} />
        </button>
        <span className={cn("font-bold tabular text-ink", text)} aria-live="polite">
          {pending ? <LoaderCircle className="size-4 animate-spin text-brand" /> : quantity}
        </span>
        <button
          type="button"
          tabIndex={inCart ? 0 : -1}
          onClick={() => updateQuantity(productId, quantity + 1)}
          disabled={pending || quantity >= stock}
          aria-label={t.card.increase}
          className={cn(
            "grid h-full place-items-center rounded-r-[var(--radius-field)] hover:bg-brand/10 disabled:opacity-35",
            size === "lg" ? "w-12" : "w-9",
          )}
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
