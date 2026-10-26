import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, Star } from "lucide-react";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { EmptyState, PageHeader, Pagination, PrimaryLink, StockBadge } from "@/components/admin/ui";
import { ProductImage } from "@/components/shop/product-image";
import type { Prisma } from "@/generated/prisma/client";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Mahsulotlar" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categoryId = typeof sp.category === "string" ? sp.category : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { category: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  const hrefFor = (p: number) => {
    const s = new URLSearchParams();
    if (q) s.set("q", q);
    if (categoryId) s.set("category", categoryId);
    if (p > 1) s.set("page", String(p));
    return `/admin/products${s.size ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Mahsulotlar"
        description={`Jami ${total} ta mahsulot`}
        action={
          <PrimaryLink href="/admin/products/new">
            <Plus className="size-4" /> Yangi mahsulot
          </PrimaryLink>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Nomi yoki artikul"
            className="h-10 w-full rounded-full border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-berry-500"
          />
        </div>
        <select
          name="category"
          defaultValue={categoryId}
          className="h-10 rounded-full border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-berry-500"
        >
          <option value="">Barcha kategoriyalar</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-full bg-ink px-5 text-sm font-bold text-cream">
          Filtrlash
        </button>
      </form>

      {products.length === 0 ? (
        <EmptyState>
          Mahsulotlar topilmadi.{" "}
          <Link href="/admin/products/new" className="font-bold text-berry-600">
            Birinchisini qo&apos;shing
          </Link>
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-white p-3 ring-1 ring-line sm:flex-nowrap"
            >
              <ProductImage src={product.images[0]} alt="" className="size-16 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/products/${product.id}`} className="truncate font-semibold hover:text-berry-600">
                    {product.name}
                  </Link>
                  {product.isFeatured && <Star className="size-4 shrink-0 fill-honey-500 text-honey-500" aria-label="Tavsiya etilgan" />}
                </div>
                <p className="text-xs text-ink-faint">
                  {product.category.name}
                  {product.sku && ` · ${product.sku}`}
                  {!product.isActive && <span className="ml-1.5 rounded bg-stone-200 px-1.5 py-0.5 font-bold text-stone-600">Yashirin</span>}
                </p>
              </div>
              <div className="w-32 text-right">
                {product.discountPrice != null ? (
                  <>
                    <p className="text-xs text-ink-faint line-through">{formatPrice(product.price)}</p>
                    <p className="font-bold text-berry-600">{formatPrice(product.discountPrice)}</p>
                  </>
                ) : (
                  <p className="font-bold">{formatPrice(product.price)}</p>
                )}
              </div>
              <div className="w-24 text-center">
                <StockBadge stock={product.stock} />
              </div>
              <ProductRowActions id={product.id} name={product.name} isActive={product.isActive} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={Math.ceil(total / ADMIN_PAGE_SIZE)} hrefFor={hrefFor} />
    </>
  );
}
