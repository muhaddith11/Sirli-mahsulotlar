"use client";

import { fill, plural } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import type { CartData } from "@/lib/cart-types";
import { formatPrice } from "@/lib/format";

/** Savat va checkout sahifalaridagi jami summa bloki */
export function OrderSummary({ cart, children }: { cart: CartData; children?: React.ReactNode }) {
  const { t, locale } = useI18n();

  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-5">
      <h2 className="text-lg font-bold tracking-[-0.01em]">{t.summary.title}</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-2">{fill(plural(locale, cart.totalQuantity, t.summary.items), { count: cart.totalQuantity })}</dt>
          <dd className="tabular">{formatPrice(cart.subtotal, locale)}</dd>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-ink-2">{t.summary.discount}</dt>
            <dd className="font-medium text-brand tabular">−{formatPrice(cart.discount, locale)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-ink-2">{t.summary.delivery}</dt>
          <dd className="text-right text-ink-2">{t.summary.deliveryValue}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
          <dt className="text-base font-semibold">{t.summary.total}</dt>
          <dd className="text-[22px] font-bold tabular">{formatPrice(cart.total, locale)}</dd>
        </div>
      </dl>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
