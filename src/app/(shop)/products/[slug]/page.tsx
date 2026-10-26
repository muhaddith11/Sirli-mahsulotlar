import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { SectionHeading } from "@/components/shop/section-heading";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { discountPercent, effectivePrice, formatPrice } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/products";

type Props = PageProps<"/products/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Mahsulot topilmadi" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category.id, product.id);
  const price = effectivePrice(product);
  const off = discountPercent(product);

  const specs = [
    { label: "Hajmi", value: product.volume },
    { label: "To'plamda", value: product.pieces ? `${product.pieces} dona` : null },
    { label: "Kategoriya", value: product.category.name },
    { label: "Artikul", value: product.sku },
  ].filter((s): s is { label: string; value: string } => Boolean(s.value));

  return (
    <div className="pb-6 pt-4 sm:pt-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-ink-faint" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-ink">
          Katalog
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <Link href={`/products?category=${product.category.slug}`} className="truncate hover:text-ink">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <ProductGallery
          images={product.images}
          name={product.name}
          badge={
            off > 0 ? (
              <span className="absolute left-4 top-4 rounded-full bg-berry-600 px-3 py-1.5 text-sm font-extrabold text-white">
                −{off}%
              </span>
            ) : null
          }
        />

        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={off > 0 ? "text-3xl font-extrabold text-berry-600" : "text-3xl font-extrabold"}>
              {formatPrice(price)}
            </span>
            {off > 0 && (
              <>
                <span className="text-lg text-ink-faint line-through">{formatPrice(product.price)}</span>
                <span className="rounded-full bg-berry-50 px-2.5 py-0.5 text-sm font-bold text-berry-700">
                  {formatPrice(product.price - price)} tejaysiz
                </span>
              </>
            )}
          </div>

          <p className="mt-2 text-sm font-semibold">
            {product.stock <= 0 ? (
              <span className="text-ink-faint">Omborda yo&apos;q</span>
            ) : product.stock <= LOW_STOCK_THRESHOLD ? (
              <span className="text-honey-500">● Oz qoldi — {product.stock} dona</span>
            ) : (
              <span className="text-leaf-600">● Omborda bor</span>
            )}
          </p>

          <div className="mt-6">
            <ProductPurchase productId={product.id} unitPrice={price} stock={product.stock} />
          </div>

          {specs.length > 0 && (
            <dl className="mt-8 divide-y divide-line rounded-3xl bg-white px-5 ring-1 ring-line">
              {specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4 py-3.5 text-sm">
                  <dt className="text-ink-soft">{spec.label}</dt>
                  <dd className="text-right font-semibold">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {product.description && (
            <section className="mt-8">
              <h2 className="mb-2 text-lg font-bold">Tavsif</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
            </section>
          )}

          <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            {[
              { icon: Truck, text: "1–2 kunda yetkazish" },
              { icon: ShieldCheck, text: "Sifat kafolati" },
              { icon: RotateCcw, text: "14 kun ichida qaytarish" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 rounded-2xl bg-leaf-50 px-3 py-2.5 font-semibold text-leaf-700">
                <Icon className="size-4 shrink-0" /> {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            title="O'xshash mahsulotlar"
            href={`/products?category=${product.category.slug}`}
          />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
