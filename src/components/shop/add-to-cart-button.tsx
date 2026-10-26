"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/providers/cart-provider";

type Props = {
  productId: string;
  productName: string;
  disabled?: boolean;
};

/** Mahsulot kartochkasidagi kichik "+" tugmasi */
export function AddToCartIconButton({ productId, productName, disabled }: Props) {
  const { addItem, isPending } = useCart();
  const pending = isPending(productId);

  return (
    <button
      type="button"
      onClick={() => addItem(productId)}
      disabled={disabled || pending}
      aria-label={`${productName} — savatga qo'shish`}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-berry-600 text-white shadow-sm transition",
        "hover:bg-berry-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-faint",
      )}
    >
      {pending ? <LoaderCircle className="size-5 animate-spin" /> : <Plus className="size-5" strokeWidth={2.5} />}
    </button>
  );
}
