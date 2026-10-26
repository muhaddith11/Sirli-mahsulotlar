import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, CircleAlert, PackageX, Wallet } from "lucide-react";
import { StockEditor } from "@/components/admin/stock-editor";
import { EmptyState, PageHeader, StockBadge } from "@/components/admin/ui";
import { ProductImage } from "@/components/shop/product-image";
import type { Prisma } from "@/generated/prisma/client";
import { cn } from "@/lib/cn";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { effectivePrice, formatNumber, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ombor" };

const FILTERS = [
  { key: "all", label: "Hammasi" },
  { key: "low", label: `Kam qolgan (≤ ${LOW_STOCK_THRESHOLD})` },
  { key: "out", label: "Tugagan" },
] as const;

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.key === sp.filter)?.key ?? "all";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: Prisma.ProductWhereInput = {};
  if (filter === "low") where.stock = { lte: LOW_STOCK_THRESHOLD };
  if (filter === "out") where.stock = { lte: 0 };
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }];

  const [products, all] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      include: { category: { select: { name: true } } },
    }),
    prisma.product.findMany({ select: { stock: true, price: true, discountPrice: true } }),
  ]);

  const totalUnits = all.reduce((sum, p) => sum + p.stock, 0);
  const stockValue = all.reduce((sum, p) => sum + p.stock * effectivePrice(p), 0);
  const lowCount = all.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;
  const outCount = all.filter((p) => p.stock <= 0).length;

  const summary = [
    { label: "Ombordagi buyumlar", value: `${formatNumber(totalUnits)} dona`, icon: Boxes, tone: "bg-info-soft text-info" },
    { label: "Ombor qiymati", value: formatPrice(stockValue), icon: Wallet, tone: "bg-success-soft text-success" },
    { label: `Kam qolgan (≤ ${LOW_STOCK_THRESHOLD})`, value: String(lowCount), icon: CircleAlert, tone: "bg-warning-soft text-warning" },
    { label: "Tugagan", value: String(outCount), icon: PackageX, tone: "bg-brand-soft text-brand" },
  ];

  return (
    <>
      <PageHeader title="Ombor" description="Qoldiqni shu yerning o'zida o'zgartiring — o'zgarish darhol saqlanadi" />

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summary.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-line">
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-[var(--radius-field)]", tone)}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-2">{label}</p>
              <p className="truncate text-lg font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/inventory" : `/admin/inventory?filter=${f.key}`}
            className={cn(
              "rounded-full px-3.5 py-2 text-sm font-semibold ring-1",
              filter === f.key ? "bg-ink text-white ring-ink" : "bg-surface text-ink-2 ring-line hover:text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
        <form className="ml-auto w-full sm:w-60">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Nomi yoki artikul"
            className="h-10 w-full rounded-[var(--radius-field)] border border-line-strong bg-surface px-4 text-sm outline-none focus:border-brand"
          />
        </form>
      </div>

      {products.length === 0 ? (
        <EmptyState>Bu filtr bo&apos;yicha mahsulot yo&apos;q</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] bg-surface ring-1 ring-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wider text-ink-3">
                <th className="px-4 py-3">Mahsulot</th>
                <th className="px-4 py-3">Artikul</th>
                <th className="px-4 py-3 text-right">Narx</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3">Qoldiqni o&apos;zgartirish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className={cn(p.stock <= 0 ? "bg-brand-soft/50" : p.stock <= LOW_STOCK_THRESHOLD && "bg-warning-soft/50")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage src={p.images[0]} alt="" className="size-11 shrink-0 rounded-[var(--radius-field)]" />
                      <div className="min-w-0">
                        <Link href={`/admin/products/${p.id}`} className="block max-w-72 truncate font-semibold hover:text-brand">
                          {p.name}
                        </Link>
                        <p className="text-xs text-ink-3">
                          {p.category.name}
                          {!p.isActive && " · yashirin"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-2">{p.sku ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatPrice(effectivePrice(p))}</td>
                  <td className="px-4 py-3">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="px-4 py-3">
                    <StockEditor key={p.stock} productId={p.id} stock={p.stock} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
