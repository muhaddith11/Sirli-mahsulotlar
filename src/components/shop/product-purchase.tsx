"use client";

import { useState } from "react";
import Link from "next/link";
import { LoaderCircle, ShoppingBag } from "lucide-react";
import { useMainButton } from "@/hooks/use-main-button";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/providers/cart-provider";
import { QuantityStepper } from "./quantity-stepper";

type Props = {
  productId: string;
  unitPrice: number;
  stock: number;
};

export function ProductPurchase({ productId, unitPrice, stock }: Props) {
  const { cart, addItem, isPending } = useCart();
  const inCart = cart.items.find((item) => item.productId === productId)?.quantity ?? 0;
  const available = Math.max(0, stock - inCart);
  const [quantity, setQuantity] = useState(1);
  const pending = isPending(productId);
  const soldOut = stock <= 0;
  const qty = Math.min(quantity, Math.max(1, available));

  const add = async () => {
    if (await addItem(productId, qty)) setQuantity(1);
  };

  // Telegram ichida asosiy amal pastki MainButton orqali bajariladi
  const inTelegram = useMainButton({
    text: soldOut
      ? "Omborda qolmagan"
      : available === 0
        ? "Hammasi savatda"
        : `Savatga qo'shish · ${formatPrice(unitPrice * qty)}`,
    onClick: add,
    enabled: !soldOut && available > 0,
    loading: pending,
  });

  if (soldOut) {
    return (
      <div className="rounded-2xl bg-cream-deep p-4 text-sm font-semibold text-ink-soft">
        Bu mahsulot hozircha omborda yo&apos;q. Tez orada keltiramiz!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQuantity} max={Math.max(1, available)} disabled={available === 0} />
        {!inTelegram && (
          <button
            type="button"
            onClick={add}
            disabled={pending || available === 0}
            className="inline-flex h-12 min-w-52 flex-1 items-center justify-center gap-2 rounded-full bg-berry-600 px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(184,50,42,0.9)] transition hover:bg-berry-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-faint disabled:shadow-none"
          >
            {pending ? <LoaderCircle className="size-5 animate-spin" /> : <ShoppingBag className="size-5" />}
            Savatga qo&apos;shish
          </button>
        )}
      </div>
      {inCart > 0 && (
        <p className="text-sm text-ink-soft">
          Savatda: <b className="text-ink">{inCart} dona</b> ·{" "}
          <Link href="/cart" className="font-bold text-berry-600 underline-offset-2 hover:underline">
            Savatga o&apos;tish
          </Link>
        </p>
      )}
    </div>
  );
}
