"use client";

import { fill, plural } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import type { CartData } from "@/lib/cart-types";
import { formatPrice } from "@/lib/format";

type Props = {
  cart: CartData;
  /** Qo'llangan promokod (checkout'da) */
  promo?: { code: string; discount: number } | null;
  /** Yetkazish: undefined — usul hali tanlanmagan; fee null — narxni operator aytadi */
  delivery?: { method: "DELIVERY" | "PICKUP"; fee: number | null };
  children?: React.ReactNode;
};

/** Savat va checkout sahifalaridagi jami summa bloki */
export function OrderSummary({ cart, promo, delivery, children }: Props) {
  const { t, locale } = useI18n();
  const promoDiscount = promo?.discount ?? 0;
  const fee = delivery?.method === "PICKUP" ? 0 : (delivery?.fee ?? null);
  const total = cart.total - promoDiscount + (fee ?? 0);

  const deliveryText =
    delivery?.method === "PICKUP"
      ? t.summary.pickupValue
      : fee == null
        ? t.summary.deliveryValue
        : fee === 0
          ? t.summary.deliveryFree
          : formatPrice(fee, locale);

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
        {promo && promoDiscount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-ink-2">
              {t.summary.promo} <span className="font-medium text-ink">{promo.code}</span>
            </dt>
            <dd className="font-medium text-brand tabular">−{formatPrice(promoDiscount, locale)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-ink-2">{delivery?.method === "PICKUP" ? t.checkout.pickup : t.summary.delivery}</dt>
          <dd className={fee === 0 ? "text-right font-medium text-success" : "text-right text-ink-2 tabular"}>{deliveryText}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
          <dt className="text-base font-semibold">{t.summary.total}</dt>
          <dd className="text-[22px] font-bold tabular">{formatPrice(total, locale)}</dd>
        </div>
      </dl>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

/** Checkout jami summasi (pastki panel va Telegram tugmasi uchun) */
export function checkoutTotal(cart: CartData, promoDiscount: number, fee: number | null) {
  return cart.total - promoDiscount + (fee ?? 0);
}
