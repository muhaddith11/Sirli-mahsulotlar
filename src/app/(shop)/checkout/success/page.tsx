import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { ProductImage } from "@/components/shop/product-image";
import { TelegramCloseButton } from "@/components/shop/telegram-close-button";
import { getI18n } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

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
        </dl>

        <ul className="mt-6 divide-y divide-line border-y border-line text-left">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
              <span className="shrink-0 overflow-hidden rounded-lg bg-cream">
                <ProductImage src={item.image} alt="" className="aspect-[4/5] w-11" />
              </span>
              <span className="line-clamp-2 flex-1">
                {(locale === "ru" && item.product?.nameRu) || item.productName}{" "}
                <span className="text-ink-3 tabular">× {item.quantity}</span>
              </span>
              <span className="shrink-0 font-medium tabular">{formatPrice(item.totalPrice, locale)}</span>
            </li>
          ))}
        </ul>
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
