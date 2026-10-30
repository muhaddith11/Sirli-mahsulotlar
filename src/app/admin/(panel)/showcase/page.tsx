import type { Metadata } from "next";
import Link from "next/link";
import { ShowcaseToggle } from "@/components/admin/showcase-toggle";
import { EmptyState, PageHeader, StockBadge } from "@/components/admin/ui";
import { ProductImage } from "@/components/shop/product-image";
import { SHOWCASE_LIMIT } from "@/lib/constants";
import { effectivePrice, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { SHOWCASE_READY } from "@/lib/services/products";

export const metadata: Metadata = { title: "Vitrina" };

async function listModels() {
  return prisma.product.findMany({
    where: SHOWCASE_READY,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: { category: { select: { name: true } } },
  });
}

function ShowcaseRow({ product, full }: { product: Awaited<ReturnType<typeof listModels>>[number]; full?: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[var(--radius-card)] bg-surface p-3 ring-1 ring-line lg:flex-nowrap">
      <ProductImage src={product.images[0]} alt="" className="size-16 shrink-0 rounded-[var(--radius-field)]" />
      <div className="min-w-48 flex-1 lg:min-w-0">
        <Link href={`/admin/products/${product.id}`} className="block truncate font-semibold hover:text-brand">
          {product.name}
        </Link>
        <p className="text-xs text-ink-3">
          {product.category.name}
          {product.sku && ` · ${product.sku}`}
          {!product.isActive && <span className="ml-1.5 rounded bg-page px-1.5 py-0.5 font-semibold text-ink-3">Yashirin</span>}
        </p>
        {product.inShowcase && (!product.isActive || product.stock <= 0) && (
          <p className="mt-0.5 text-xs font-semibold text-warning">Yashirin yoki tugagan mahsulot vitrinada ko&apos;rinmaydi</p>
        )}
      </div>
      <div className="flex flex-1 items-center justify-between gap-3 lg:flex-none lg:gap-4">
        <p className="whitespace-nowrap font-bold lg:w-28 lg:text-right">{formatPrice(effectivePrice(product))}</p>
        <div className="whitespace-nowrap lg:w-24 lg:text-center">
          <StockBadge stock={product.stock} />
        </div>
        <ShowcaseToggle id={product.id} inShowcase={product.inShowcase} full={full} />
      </div>
    </li>
  );
}

export default async function AdminShowcasePage() {
  const products = await listModels();
  const placed = products.filter((product) => product.inShowcase);
  const rest = products.filter((product) => !product.inShowcase);
  const full = placed.length >= SHOWCASE_LIMIT;

  return (
    <>
      <PageHeader
        title="Vitrina"
        description={`Bosh sahifadagi «Eng ommabop» bo'limi. Band joylar: ${placed.length} / ${SHOWCASE_LIMIT}`}
      />

      {products.length === 0 ? (
        <EmptyState>Hozircha 3D modeli bor mahsulot yo&apos;q.</EmptyState>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-bold">Vitrinada turgan mahsulotlar</h2>
            {placed.length === 0 ? (
              <EmptyState>Vitrina bo&apos;sh, bosh sahifada bu bo&apos;lim ko&apos;rinmaydi. Pastdan mahsulot tanlang.</EmptyState>
            ) : (
              <ul className="space-y-2">
                {placed.map((product) => (
                  <ShowcaseRow key={product.id} product={product} />
                ))}
              </ul>
            )}
          </section>

          {rest.length > 0 && (
            <section>
              <h2 className="text-lg font-bold">3D modeli bor, vitrinaga qo&apos;yish mumkin</h2>
              <p className="mb-3 mt-0.5 text-sm text-ink-2">
                {full ? "Vitrina to'la. Yangisini qo'yish uchun avval yuqoridan bittasini olib tashlang." : `Yana ${SHOWCASE_LIMIT - placed.length} ta joy bor.`}
              </p>
              <ul className="space-y-2">
                {rest.map((product) => (
                  <ShowcaseRow key={product.id} product={product} full={full} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}
