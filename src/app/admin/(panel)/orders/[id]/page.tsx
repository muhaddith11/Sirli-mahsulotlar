import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Card } from "@/components/admin/ui";
import { ProductImage } from "@/components/shop/product-image";
import { ORDER_SOURCE_LABELS } from "@/lib/constants";
import { formatDate, formatPhone, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Buyurtma" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { slug: true } } } },
      user: { select: { username: true, telegramId: true, firstName: true, lastName: true } },
    },
  });
  if (!order) notFound();

  const telegramLink = order.user?.username
    ? `https://t.me/${order.user.username}`
    : order.user?.telegramId
      ? `tg://user?id=${order.user.telegramId}`
      : null;

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> Buyurtmalar
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Buyurtma #{order.number}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {formatDate(order.createdAt)} · {ORDER_SOURCE_LABELS[order.source]} orqali
          </p>
        </div>
        <div className="w-48">
          <OrderStatusSelect key={order.status} orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-4 sm:p-5">
          <h2 className="mb-3 font-bold">Mahsulotlar</h2>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <ProductImage src={item.image} alt="" className="size-14 rounded-xl" />
                <div className="min-w-0 flex-1">
                  {item.product ? (
                    <Link href={`/products/${item.product.slug}`} target="_blank" className="font-semibold hover:text-berry-600">
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="font-semibold">
                      {item.productName} <span className="text-xs font-normal text-ink-faint">(o&apos;chirilgan)</span>
                    </p>
                  )}
                  <p className="text-sm text-ink-soft">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="font-bold">{formatPrice(item.totalPrice)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-line pt-4">
            <span className="font-bold">Jami</span>
            <span className="text-2xl font-extrabold">{formatPrice(order.totalAmount)}</span>
          </div>
        </Card>

        <Card className="space-y-4 p-4 sm:p-5">
          <h2 className="font-bold">Mijoz</h2>
          <p className="text-lg font-semibold">{order.customerName}</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${order.phone}`}
              className="inline-flex items-center gap-2 rounded-full bg-leaf-50 px-4 py-2 text-sm font-bold text-leaf-700"
            >
              <Phone className="size-4" /> {formatPhone(order.phone)}
            </a>
            {telegramLink && (
              <a
                href={telegramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700"
              >
                <Send className="size-4" /> {order.user?.username ? `@${order.user.username}` : "Telegram"}
              </a>
            )}
          </div>
          <div className="flex gap-3 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-berry-600" />
            <p className="whitespace-pre-line">{order.deliveryAddress}</p>
          </div>
          {order.comment && (
            <div className="flex gap-3 rounded-xl bg-cream p-3 text-sm">
              <MessageSquare className="mt-0.5 size-4 shrink-0 text-berry-600" />
              <p className="whitespace-pre-line">{order.comment}</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
