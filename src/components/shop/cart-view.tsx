"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, ShoppingBag, Trash2, TriangleAlert } from "lucide-react";
import { useMainButton } from "@/hooks/use-main-button";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/providers/cart-provider";
import { OrderSummary } from "./order-summary";
import { ProductImage } from "./product-image";
import { QuantityStepper } from "./quantity-stepper";

export function CartView() {
  const router = useRouter();
  const { cart, loaded, updateQuantity, removeItem, isPending } = useCart();
  const empty = cart.items.length === 0;
  const canCheckout = !empty && !cart.hasUnavailable;

  const inTelegram = useMainButton({
    text: `Rasmiylashtirish · ${formatPrice(cart.total)}`,
    onClick: () => router.push("/checkout"),
    visible: loaded && !empty,
    enabled: canCheckout,
  });

  if (!loaded) {
    return (
      <div className="grid place-items-center py-24 text-ink-faint">
        <LoaderCircle className="size-8 animate-spin" />
      </div>
    );
  }

  if (empty) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <span className="grid size-24 place-items-center rounded-full bg-berry-50 text-berry-600">
          <ShoppingBag className="size-10" />
        </span>
        <h2 className="mt-6 font-display text-2xl font-semibold">Savatingiz hozircha bo&apos;sh</h2>
        <p className="mt-2 text-sm text-ink-soft">Katalogdan o&apos;zingizga yoqqan idishlarni tanlang.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-berry-600 px-6 text-sm font-bold text-white hover:bg-berry-700"
        >
          Katalogga o&apos;tish <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <ul className="space-y-3">
        {cart.items.map((item) => {
          const pending = isPending(item.productId);
          return (
            <li
              key={item.productId}
              className={cn(
                "flex gap-3 rounded-3xl bg-white p-3 ring-1 ring-line transition sm:gap-4 sm:p-4",
                pending && "opacity-60",
                !item.available && "ring-berry-200",
              )}
            >
              <Link href={`/products/${item.slug}`} className="shrink-0">
                <ProductImage src={item.image} alt={item.name} className="size-24 rounded-2xl sm:size-28" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug sm:text-[15px]">
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    disabled={pending}
                    className="-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-berry-50 hover:text-berry-600"
                    aria-label={`${item.name} — o'chirish`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {formatPrice(item.unitPrice)} / dona{item.volume && ` · ${item.volume}`}
                </p>
                {!item.available && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-berry-600">
                    <TriangleAlert className="size-3.5" />
                    {item.stock > 0 ? `Omborda faqat ${item.stock} dona qoldi` : "Omborda qolmagan"}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                  <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    min={1}
                    max={Math.max(item.stock, 1)}
                    disabled={pending || item.stock <= 0}
                    onChange={(quantity) => updateQuantity(item.productId, quantity)}
                  />
                  <p className="font-extrabold">{formatPrice(item.lineTotal)}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="lg:sticky lg:top-24">
        <OrderSummary cart={cart}>
          {cart.hasUnavailable && (
            <p className="mb-3 rounded-2xl bg-berry-50 p-3 text-xs font-semibold text-berry-700">
              Ba&apos;zi mahsulotlar omborda yetarli emas. Miqdorini kamaytiring yoki o&apos;chiring.
            </p>
          )}
          {!inTelegram && (
            <Link
              href={canCheckout ? "/checkout" : "#"}
              aria-disabled={!canCheckout}
              className={cn(
                "flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold transition",
                canCheckout
                  ? "bg-berry-600 text-white hover:bg-berry-700"
                  : "pointer-events-none bg-line text-ink-faint",
              )}
            >
              Rasmiylashtirish <ArrowRight className="size-4" />
            </Link>
          )}
        </OrderSummary>
      </div>
    </div>
  );
}
