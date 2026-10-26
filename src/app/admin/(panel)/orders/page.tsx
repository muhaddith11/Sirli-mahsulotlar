import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { EmptyState, PageHeader, Pagination } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { cn } from "@/lib/cn";
import { ADMIN_PAGE_SIZE, ORDER_SOURCE_LABELS, ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPhone, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { orderStatusSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Buyurtmalar" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = orderStatusSchema.safeParse(sp.status).data;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (q) {
    const digits = q.replace(/\D/g, "");
    where.OR = [
      { customerName: { contains: q, mode: "insensitive" } },
      ...(digits ? [{ phone: { contains: digits } }] : []),
      ...(/^#?\d+$/.test(q) ? [{ number: Number(q.replace("#", "")) }] : []),
    ];
  }

  const [orders, total, grouped] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count])) as Partial<Record<string, number>>;
  const allCount = grouped.reduce((sum, g) => sum + g._count, 0);
  const href = (params: { status?: string; page?: number }) => {
    const s = new URLSearchParams();
    if (params.status) s.set("status", params.status);
    if (q) s.set("q", q);
    if (params.page && params.page > 1) s.set("page", String(params.page));
    return `/admin/orders${s.size ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Buyurtmalar" description="Holatni o'zgartirish uchun ro'yxatdagi tanlovdan foydalaning" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <nav className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Holat bo'yicha">
          {[undefined, ...ORDER_STATUSES].map((s) => (
            <Link
              key={s ?? "all"}
              href={href({ status: s })}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition",
                status === s ? "bg-ink text-white ring-ink" : "bg-surface text-ink-2 ring-line hover:text-ink",
              )}
            >
              {s ? ORDER_STATUS_LABELS[s] : "Hammasi"}
              <span className="text-xs opacity-70">{s ? (counts[s] ?? 0) : allCount}</span>
            </Link>
          ))}
        </nav>
        <form className="relative ml-auto w-full sm:w-64">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Ism, telefon yoki #raqam"
            className="h-10 w-full rounded-[var(--radius-field)] border border-line-strong bg-surface pl-9 pr-3 text-sm outline-none focus:border-brand"
          />
        </form>
      </div>

      {orders.length === 0 ? (
        <EmptyState>Buyurtmalar topilmadi</EmptyState>
      ) : (
        <>
          <div className="hidden grid-cols-[80px_1.4fr_1fr_150px_170px] gap-4 px-4 pb-2 text-xs font-bold uppercase tracking-wider text-ink-3 md:grid">
            <span>Raqam</span>
            <span>Mijoz</span>
            <span>Tarkibi</span>
            <span>Summa</span>
            <span>Holat</span>
          </div>
          <ul className="space-y-2">
            {orders.map((order) => (
              <li
                key={order.id}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-line md:grid-cols-[80px_1.4fr_1fr_150px_170px]"
              >
                <Link href={`/admin/orders/${order.id}`} className="font-bold tabular-nums hover:text-brand">
                  #{order.number}
                  <span className="block text-[11px] font-medium text-ink-3 md:hidden">{formatDate(order.createdAt)}</span>
                </Link>
                <div className="col-span-2 row-start-2 min-w-0 md:col-span-1 md:row-start-auto">
                  <Link href={`/admin/orders/${order.id}`} className="block truncate font-semibold hover:text-brand">
                    {order.customerName}
                  </Link>
                  <a href={`tel:${order.phone}`} className="text-sm text-ink-2 hover:text-ink">
                    {formatPhone(order.phone)}
                  </a>
                </div>
                <div className="col-span-2 row-start-3 text-sm text-ink-2 md:col-span-1 md:row-start-auto">
                  {order._count.items} xil mahsulot · {ORDER_SOURCE_LABELS[order.source]}
                  <span className="hidden text-xs text-ink-3 md:block">{formatDate(order.createdAt)}</span>
                </div>
                <div className="row-start-4 font-bold md:row-start-auto">{formatPrice(order.totalAmount)}</div>
                <div className="col-start-2 row-start-1 md:col-start-auto md:row-start-auto">
                  <OrderStatusSelect key={order.status} orderId={order.id} status={order.status} />
                </div>
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            totalPages={Math.ceil(total / ADMIN_PAGE_SIZE)}
            hrefFor={(p) => href({ status, page: p })}
          />
        </>
      )}
    </>
  );
}
