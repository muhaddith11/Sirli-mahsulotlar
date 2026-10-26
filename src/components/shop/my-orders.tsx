"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, LoaderCircle, Package } from "lucide-react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { fill, plural } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { readOrderIds } from "@/lib/order-history";
import { useTelegram } from "@/providers/telegram-provider";
import { ProductImage } from "./product-image";

type OrderRow = {
  id: string;
  number: number;
  status: OrderStatus;
  totalAmount: number;
  date: string;
  images: string[];
  itemCount: number;
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  NEW: "bg-info-soft text-info",
  PREPARING: "bg-warning-soft text-warning",
  DELIVERING: "bg-transit-soft text-transit",
  COMPLETED: "bg-success-soft text-success",
  CANCELLED: "bg-page text-ink-3",
};

export function MyOrders() {
  const { t, locale } = useI18n();
  const { ready, initData } = useTelegram();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [source, setSource] = useState<"telegram" | "device" | "none">("none");

  useEffect(() => {
    if (!ready) return;
    const ids = readOrderIds();
    fetch("/api/my-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initData ? { initData } : { ids }),
    })
      .then((response) => response.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setSource(data.source ?? "none");
      })
      .catch(() => setOrders([]));
  }, [ready, initData]);

  if (!orders) {
    return (
      <div className="grid place-items-center py-24 text-ink-3">
        <LoaderCircle className="size-8 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-14 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-surface text-ink-3">
          <Package className="size-9" strokeWidth={1.5} />
        </span>
        <h2 className="mt-5 text-xl font-bold">{t.orders.emptyTitle}</h2>
        <p className="mt-1.5 text-sm text-ink-2">{t.orders.emptyText}</p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-field)] bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-hover"
        >
          {t.cart.goToCatalog}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {source === "device" && <p className="mb-3 text-sm text-ink-3">{t.orders.deviceNote}</p>}
      <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface">
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/orders/${order.id}`} className="flex items-center gap-3 px-4 py-4 hover:bg-cream-soft">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold tabular">{fill(t.orders.order, { number: order.number })}</span>
                  <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", STATUS_TONE[order.status])}>
                    {t.status[order.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-3 tabular">
                  {order.date} · {fill(plural(locale, order.itemCount, t.orders.items), { count: order.itemCount })}
                </p>
                <div className="mt-2.5 flex gap-1.5">
                  {order.images.map((src, i) => (
                    <span key={`${src}-${i}`} className="overflow-hidden rounded-md bg-cream">
                      <ProductImage src={src} alt="" className="aspect-[4/5] w-10" />
                    </span>
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-right font-bold tabular">{formatPrice(order.totalAmount, locale)}</span>
              <ChevronRight className="size-5 shrink-0 text-ink-3" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
