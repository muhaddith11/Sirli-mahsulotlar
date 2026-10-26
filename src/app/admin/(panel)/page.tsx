import Link from "next/link";
import { ArrowRight, Banknote, ClipboardList, PackageX, ShoppingCart } from "lucide-react";
import { Card, PageHeader, StatusBadge, StockBadge } from "@/components/admin/ui";
import { ProductImage } from "@/components/shop/product-image";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { startOfMonthTashkent, startOfTodayTashkent } from "@/lib/dates";
import { formatDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const today = startOfTodayTashkent();
  const monthStart = startOfMonthTashkent();
  const notCancelled = { status: { not: "CANCELLED" as const } };

  const [newOrders, todayStats, monthStats, lowStockCount, recentOrders, lowStock] = await Promise.all([
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.aggregate({ where: { createdAt: { gte: today }, ...notCancelled }, _count: true, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: monthStart }, ...notCancelled }, _count: true, _sum: { totalAmount: true } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, number: true, customerName: true, totalAmount: true, status: true, createdAt: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 6,
      select: { id: true, name: true, images: true, stock: true },
    }),
  ]);

  const stats = [
    { label: "Yangi buyurtmalar", value: String(newOrders), hint: "Ko'rib chiqilishi kerak", icon: ClipboardList, tone: "bg-sky-50 text-sky-700", href: "/admin/orders?status=NEW" },
    { label: "Bugun", value: formatPrice(todayStats._sum.totalAmount ?? 0), hint: `${todayStats._count} ta buyurtma`, icon: ShoppingCart, tone: "bg-leaf-50 text-leaf-700", href: "/admin/orders" },
    { label: "Shu oy", value: formatPrice(monthStats._sum.totalAmount ?? 0), hint: `${monthStats._count} ta buyurtma`, icon: Banknote, tone: "bg-honey-100 text-amber-800", href: "/admin/orders" },
    { label: "Kam qolgan", value: String(lowStockCount), hint: `≤ ${LOW_STOCK_THRESHOLD} dona qolgan mahsulotlar`, icon: PackageX, tone: "bg-berry-50 text-berry-700", href: "/admin/inventory?filter=low" },
  ];

  return (
    <>
      <PageHeader title="Boshqaruv paneli" description="Do'kon holati bir qarashda" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon, tone, href }) => (
          <Link key={label} href={href} className="rounded-2xl bg-white p-4 ring-1 ring-line transition hover:ring-ink-faint">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-soft">{label}</p>
              <span className={`grid size-9 place-items-center rounded-xl ${tone}`}>
                <Icon className="size-[18px]" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight">{value}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">So&apos;nggi buyurtmalar</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-bold text-berry-600">
              Barchasi <ArrowRight className="size-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">Hali buyurtmalar yo&apos;q</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-3 py-3 hover:bg-cream/50">
                    <span className="w-14 shrink-0 font-bold tabular-nums">#{order.number}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{order.customerName}</span>
                      <span className="block text-xs text-ink-faint">{formatDate(order.createdAt)}</span>
                    </span>
                    <span className="hidden text-sm font-bold sm:block">{formatPrice(order.totalAmount)}</span>
                    <StatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Omborda kam qolgan</h2>
            <Link href="/admin/inventory?filter=low" className="inline-flex items-center gap-1 text-sm font-bold text-berry-600">
              Ombor <ArrowRight className="size-4" />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">Hammasi yetarli 👍</p>
          ) : (
            <ul className="space-y-2.5">
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center gap-3">
                  <ProductImage src={product.images[0]} alt="" className="size-10 rounded-lg" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{product.name}</span>
                  <StockBadge stock={product.stock} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
