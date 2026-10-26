"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Minus, Plus, ShoppingCart, Trash2, TriangleAlert } from "lucide-react";
import { fill, localized } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useMainButton } from "@/hooks/use-main-button";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/providers/cart-provider";
import { OrderSummary } from "./order-summary";
import { ProductImage } from "./product-image";

export function CartView() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { cart, loaded, updateQuantity, removeItem, isPending } = useCart();
  const empty = cart.items.length === 0;
  const canCheckout = !empty && !cart.hasUnavailable;

  const inTelegram = useMainButton({
    text: fill(t.cart.checkoutTotal, { total: formatPrice(cart.total, locale) }),
    onClick: () => router.push("/checkout"),
    visible: loaded && !empty,
    enabled: canCheckout,
  });

  if (!loaded) {
    return (
      <div className="grid place-items-center py-24 text-ink-3">
        <LoaderCircle className="size-8 animate-spin" />
      </div>
    );
  }

  if (empty) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-14 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-surface text-ink-3">
          <ShoppingCart className="size-9" strokeWidth={1.5} />
        </span>
        <h2 className="mt-5 text-xl font-bold">{t.cart.emptyTitle}</h2>
        <p className="mt-1.5 text-sm text-ink-2">{t.cart.emptyText}</p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-field)] bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-hover"
        >
          {t.cart.goToCatalog}
        </Link>
      </div>
    );
  }

  const checkoutButton = (
    <Link
      href={canCheckout ? "/checkout" : "#"}
      aria-disabled={!canCheckout}
      className={cn(
        "flex h-12 w-full items-center justify-center rounded-[var(--radius-field)] text-[15px] font-semibold transition-colors",
        canCheckout ? "bg-brand text-white hover:bg-brand-hover active:bg-brand-press" : "pointer-events-none bg-page text-ink-3",
      )}
    >
      {t.cart.checkout}
    </Link>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-6">
      <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface px-4">
        {cart.items.map((item) => {
          const pending = isPending(item.productId);
          const name = localized(locale, item.name, item.nameRu);
          const discounted = item.discountPrice != null && item.discountPrice < item.price;
          return (
            <li key={item.productId} className={cn("flex gap-3 py-4 transition-opacity sm:gap-4", pending && "opacity-60")}>
              <Link href={`/products/${item.slug}`} className="shrink-0 overflow-hidden rounded-[10px] bg-cream">
                <ProductImage src={item.image} alt="" className="aspect-[4/5] w-20 sm:w-24" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm leading-snug hover:text-brand sm:text-[15px]">
                    {name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    disabled={pending}
                    aria-label={fill(t.cart.remove, { name })}
                    className="-mr-2 -mt-1.5 grid size-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-page hover:text-brand"
                  >
                    <Trash2 className="size-[18px]" strokeWidth={1.75} />
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-ink-3 tabular">
                  {fill(t.cart.perUnit, { price: formatPrice(item.unitPrice, locale) })}
                  {item.volume && ` · ${item.volume}`}
                </p>
                {!item.available && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-brand">
                    <TriangleAlert className="size-3.5 shrink-0" />
                    {item.stock > 0 ? fill(t.cart.onlyLeft, { count: item.stock }) : t.cart.soldOut}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2.5">
                  <div className="inline-flex h-9 items-center rounded-[var(--radius-field)] bg-page">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={pending || item.quantity <= 1}
                      aria-label={t.card.decrease}
                      className="grid h-full w-9 place-items-center rounded-l-[var(--radius-field)] hover:bg-line disabled:opacity-35"
                    >
                      <Minus className="size-4" strokeWidth={2.5} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={pending || item.quantity >= item.stock}
                      aria-label={t.card.increase}
                      className="grid h-full w-9 place-items-center rounded-r-[var(--radius-field)] hover:bg-line disabled:opacity-35"
                    >
                      <Plus className="size-4" strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-base font-bold tabular", discounted && "text-brand")}>
                      {formatPrice(item.lineTotal, locale)}
                    </p>
                    {discounted && (
                      <p className="text-xs text-ink-3 line-through tabular">{formatPrice(item.price * item.quantity, locale)}</p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="lg:sticky lg:top-32">
        <OrderSummary cart={cart}>
          {cart.hasUnavailable && (
            <p className="mb-3 rounded-[var(--radius-field)] bg-brand-soft p-3 text-xs font-medium leading-relaxed text-brand">
              {t.cart.unavailable}
            </p>
          )}
          {!inTelegram && <div className="hidden lg:block">{checkoutButton}</div>}
        </OrderSummary>
      </div>

      {!inTelegram && (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface px-4 py-2.5 shadow-[var(--shadow-bar)] md:bottom-0 lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs text-ink-3">{t.summary.total}</p>
              <p className="text-lg font-bold leading-tight tabular">{formatPrice(cart.total, locale)}</p>
            </div>
            <div className="flex-1">{checkoutButton}</div>
          </div>
        </div>
      )}
    </div>
  );
}
