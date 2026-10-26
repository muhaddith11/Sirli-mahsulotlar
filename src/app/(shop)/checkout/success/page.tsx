import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { ProductImage } from "@/components/shop/product-image";
import { TelegramCloseButton } from "@/components/shop/telegram-close-button";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Buyurtma qabul qilindi" };

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { id } = await searchParams;
  if (typeof id !== "string") notFound();

  // Buyurtma ID (cuid) taxmin qilib bo'lmaydi — shaxsiy ma'lumotlarni ko'rsatmaymiz
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      number: true,
      status: true,
      totalAmount: true,
      items: { select: { id: true, productName: true, image: true, quantity: true, totalPrice: true } },
    },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-lg py-10 text-center">
      <TelegramCloseButton />
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-leaf-50 text-leaf-600">
        <CircleCheck className="size-10" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">Rahmat! Buyurtmangiz qabul qilindi</h1>
      <p className="mt-2 text-ink-soft">
        Buyurtma raqami: <b className="text-ink">#{order.number}</b> · {ORDER_STATUS_LABELS[order.status]}
      </p>
      <p className="mt-1 text-sm text-ink-soft">Operatorimiz tez orada siz bilan bog&apos;lanadi.</p>

      <ul className="mt-8 space-y-2 rounded-3xl bg-white p-4 text-left ring-1 ring-line">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 text-sm">
            <ProductImage src={item.image} alt="" className="size-12 rounded-xl" />
            <span className="line-clamp-2 flex-1">
              {item.productName} <span className="text-ink-faint">× {item.quantity}</span>
            </span>
            <span className="shrink-0 font-semibold">{formatPrice(item.totalPrice)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-dashed border-line pt-3 font-bold">
          <span>Jami</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </li>
      </ul>

      <Link
        href="/products"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-bold text-cream hover:bg-berry-700"
      >
        Xaridni davom ettirish
      </Link>
    </div>
  );
}
