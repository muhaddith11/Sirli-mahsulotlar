import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { STATUS_TONE } from "@/components/shop/my-orders";
import { ProductImage } from "@/components/shop/product-image";
import { fill } from "@/i18n";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { formatDate, formatPrice, keepUnits } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { robots: { index: false } };

/** Mijoz uchun buyurtma tafsilotlari. ID (cuid) taxmin qilib bo'lmaydi — shaxsiy ma'lumot ko'rsatilmaydi. */
export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const [{ locale, t }, order] = await Promise.all([
    getI18n(),
    prisma.order.findUnique({
      where: { id },
      select: {
        number: true,
        status: true,
        totalAmount: true,
        deliveryMethod: true,
        deliveryFee: true,
        promoCodeText: true,
        promoDiscount: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            image: true,
            quantity: true,
            totalPrice: true,
            product: { select: { slug: true, nameRu: true } },
          },
        },
      },
    }),
  ]);
  if (!order) notFound();

  return (
    <div className="max-w-3xl pb-6 pt-4 md:pt-6">
      <Link href="/orders" className="mb-3 inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
        <ChevronLeft className="size-4" />
        {t.orders.back}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-[-0.02em] tabular md:text-3xl">{fill(t.orders.order, { number: order.number })}</h1>
        <span className={cn("rounded-md px-2.5 py-1 text-sm font-semibold", STATUS_TONE[order.status])}>{t.status[order.status]}</span>
      </div>
      <p className="mt-1 text-sm text-ink-3 tabular">
        {t.orders.date}: {formatDate(order.createdAt)}
      </p>

      <div className="mt-5 rounded-[var(--radius-card)] bg-surface px-4">
        <ul className="divide-y divide-line">
          {order.items.map((item) => {
            const name = keepUnits((locale === "ru" && item.product?.nameRu) || item.productName);
            const body = (
              <>
                <span className="shrink-0 overflow-hidden rounded-lg bg-cream">
                  <ProductImage src={item.image} alt="" className="aspect-[4/5] w-12" />
                </span>
                <span className="line-clamp-2 flex-1 text-sm">
                  {name} <span className="text-ink-3 tabular">× {item.quantity}</span>
                </span>
                <span className="shrink-0 text-sm font-medium tabular">{formatPrice(item.totalPrice, locale)}</span>
              </>
            );
            return (
              <li key={item.id}>
                {item.product ? (
                  <Link href={`/products/${item.product.slug}`} className="flex items-center gap-3 py-3 hover:text-brand">
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 py-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
        <dl className="border-t border-line pt-3 space-y-1.5 text-left text-sm text-ink-2">
          {order.promoDiscount > 0 && (
            <div className="flex justify-between">
              <dt>
                {t.summary.promo} {order.promoCodeText}
              </dt>
              <dd className="text-brand tabular">−{formatPrice(order.promoDiscount, locale)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>{order.deliveryMethod === "PICKUP" ? t.checkout.pickup : t.summary.delivery}</dt>
            <dd className="tabular">
              {order.deliveryMethod === "PICKUP" || order.deliveryFee === 0
                ? t.summary.deliveryFree
                : order.deliveryFee == null
                  ? t.summary.deliveryValue
                  : formatPrice(order.deliveryFee, locale)}
            </dd>
          </div>
        </dl>
        <p className="flex justify-between py-4 text-base font-bold">
          <span>{t.orders.total}</span>
          <span className="tabular">{formatPrice(order.totalAmount, locale)}</span>
        </p>
      </div>
    </div>
  );
}
