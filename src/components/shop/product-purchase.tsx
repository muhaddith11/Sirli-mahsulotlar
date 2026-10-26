"use client";

import Link from "next/link";
import { fill } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useMainButton } from "@/hooks/use-main-button";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/providers/cart-provider";
import { CartControl } from "./cart-control";

type Props = {
  productId: string;
  productName: string;
  unitPrice: number;
  oldPrice: number | null;
  stock: number;
};

/**
 * Telefondagi xarid: pastda yopishqoq panel, Telegram ichida esa Telegram'ning MainButton tugmasi.
 * Sahifada faqat bir marta joylashtiriladi (MainButton bitta).
 */
export function ProductPurchase({ productId, productName, unitPrice, oldPrice, stock }: Props) {
  const { t, locale } = useI18n();
  const { quantityOf, addItem, isPending } = useCart();
  const inCart = quantityOf(productId);
  const soldOut = stock <= 0;

  const inTelegram = useMainButton({
    text: soldOut
      ? t.product.outOfStock
      : inCart > 0
        ? `${fill(t.product.inCart, { count: inCart })} · +1`
        : `${t.product.addToCart} · ${formatPrice(unitPrice, locale)}`,
    onClick: () => void addItem(productId),
    enabled: !soldOut && inCart < stock,
    loading: isPending(productId),
  });

  if (inTelegram) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface px-4 py-2.5 shadow-[var(--shadow-bar)] md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight tabular">{formatPrice(unitPrice, locale)}</p>
          {oldPrice != null && <p className="text-xs text-ink-3 line-through tabular">{formatPrice(oldPrice, locale)}</p>}
        </div>
        <div className="flex-1">
          <CartControl productId={productId} productName={productName} stock={stock} size="lg" />
        </div>
      </div>
    </div>
  );
}

/** Planshet va kompyuterdagi xarid tugmasi */
export function BuyButton({ productId, productName, stock }: Pick<Props, "productId" | "productName" | "stock">) {
  const { t } = useI18n();
  const { quantityOf } = useCart();

  return (
    <div>
      <CartControl productId={productId} productName={productName} stock={stock} size="lg" />
      {quantityOf(productId) > 0 && (
        <Link href="/cart" className="mt-3 block text-center text-sm font-medium text-brand hover:underline">
          {t.product.goToCart}
        </Link>
      )}
    </div>
  );
}
