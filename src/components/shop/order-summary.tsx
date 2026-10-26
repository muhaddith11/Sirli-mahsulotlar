import { formatPrice } from "@/lib/format";
import type { CartData } from "@/lib/cart-types";

/** Savat va checkout sahifalaridagi jami summa bloki */
export function OrderSummary({ cart, children }: { cart: CartData; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-5 ring-1 ring-line">
      <h2 className="text-lg font-bold">Buyurtma</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Mahsulotlar ({cart.totalQuantity} dona)</dt>
          <dd className="font-semibold">{formatPrice(cart.subtotal)}</dd>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between text-berry-600">
            <dt>Chegirma</dt>
            <dd className="font-semibold">−{formatPrice(cart.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-soft">Yetkazib berish</dt>
          <dd className="font-semibold text-leaf-600">Operator aytadi</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-dashed border-line pt-3">
          <dt className="font-bold">Jami</dt>
          <dd className="text-2xl font-extrabold">{formatPrice(cart.total)}</dd>
        </div>
      </dl>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
