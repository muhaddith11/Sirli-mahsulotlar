import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, Send } from "lucide-react";
import { PaymentDetails } from "@/components/shop/payment-details";
import { ProductImage } from "@/components/shop/product-image";
import { TelegramCloseButton } from "@/components/shop/telegram-close-button";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { PAYMENT_STATUS_STYLES } from "@/lib/constants";
import { formatPrice, keepUnits } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getPaymentSettings } from "@/lib/services/payments";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.success };
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { id } = await searchParams;
  if (typeof id !== "string") notFound();

  const { locale, t } = await getI18n();
  // Buyurtma ID (cuid) taxmin qilib bo'lmaydi — shaxsiy ma'lumotlarni ko'rsatmaymiz
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      number: true,
      status: true,
      totalAmount: true,
      source: true,
      deliveryMethod: true,
      deliveryFee: true,
      paymentMethod: true,
      paymentStatus: true,
      promoCodeText: true,
      promoDiscount: true,
      items: {
        select: {
          id: true,
          productName: true,
          image: true,
          quantity: true,
          totalPrice: true,
          product: { select: { nameRu: true } },
        },
      },
    },
  });
  if (!order) notFound();

  // Kartaga o'tkazma: tasdiqlanmaguncha rekvizitlar va chek yuborish yo'li ko'rsatiladi
  const payment = order.paymentMethod === "CARD" && order.paymentStatus !== "PAID" ? await getPaymentSettings() : null;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;

  return (
    <div className="mx-auto max-w-lg pb-6 pt-8 md:pt-12">
      <TelegramCloseButton />
      <div className="rounded-[var(--radius-card)] bg-surface p-6 text-center sm:p-8">
        <CircleCheck className="mx-auto size-14 text-success" strokeWidth={1.5} />
        <h1 className="mt-4 text-2xl font-bold tracking-[-0.02em]">{t.success.title}</h1>
        <p className="mt-2 text-ink-2">{t.success.operator}</p>

        <dl className="mx-auto mt-5 grid max-w-xs grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-field)] bg-line text-sm">
          <div className="bg-page px-3 py-2.5">
            <dt className="text-xs text-ink-3">{t.success.number}</dt>
            <dd className="text-base font-bold tabular">#{order.number}</dd>
          </div>
          <div className="bg-page px-3 py-2.5">
            <dt className="text-xs text-ink-3">{t.success.status}</dt>
            <dd className="text-base font-semibold">{t.status[order.status]}</dd>
          </div>
          {order.paymentMethod === "CARD" && (
            <div className="col-span-2 flex items-center justify-between gap-2 bg-page px-3 py-2.5">
              <dt className="text-xs text-ink-3">{t.payment.statusLabel}</dt>
              <dd
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                  PAYMENT_STATUS_STYLES[order.paymentStatus],
                )}
              >
                {t.payment.status[order.paymentStatus]}
              </dd>
            </div>
          )}
        </dl>

        {payment && (
          <div className="mt-5">
            <PaymentDetails
              payment={payment}
              amount={formatPrice(order.totalAmount, locale)}
              deliveryExtra={order.deliveryMethod === "DELIVERY" && order.deliveryFee == null}
            >
              {order.source === "TELEGRAM" ? (
                t.payment.sendReceiptTelegram
              ) : (
                <>
                  <p>{t.payment.sendReceiptWeb}</p>
                  {botUsername && (
                    <a
                      href={`https://t.me/${botUsername}?start=pay_${id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 flex h-11 items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#229ED9] text-sm font-semibold text-white hover:bg-[#1c8cc2]"
                    >
                      <Send className="size-4" />
                      {t.payment.sendReceipt}
                    </a>
                  )}
                </>
              )}
            </PaymentDetails>
          </div>
        )}

        <ul className="mt-6 divide-y divide-line border-y border-line text-left">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
              <span className="shrink-0 overflow-hidden rounded-lg bg-cream">
                <ProductImage src={item.image} alt="" className="aspect-[4/5] w-11" />
              </span>
              <span className="line-clamp-2 flex-1">
                {keepUnits((locale === "ru" && item.product?.nameRu) || item.productName)}{" "}
                <span className="text-ink-3 tabular">× {item.quantity}</span>
              </span>
              <span className="shrink-0 font-medium tabular">{formatPrice(item.totalPrice, locale)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 text-left text-sm text-ink-2">
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
        <p className="mt-4 flex justify-between text-base font-bold">
          <span>{t.success.total}</span>
          <span className="tabular">{formatPrice(order.totalAmount, locale)}</span>
        </p>

        <Link
          href="/products"
          className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-field)] bg-brand text-[15px] font-semibold text-white hover:bg-brand-hover"
        >
          {t.success.continue}
        </Link>
      </div>
    </div>
  );
}
