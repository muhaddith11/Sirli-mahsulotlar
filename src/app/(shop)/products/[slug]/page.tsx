import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Store, Truck, Wallet } from "lucide-react";
import { ProductRail } from "@/components/shop/product-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { BuyButton, ProductPurchase } from "@/components/shop/product-purchase";
import { SectionHeading } from "@/components/shop/section-heading";
import { fill, localized, type Dictionary, type Locale } from "@/i18n";
import { getI18n } from "@/i18n/server";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { discountPercent, effectivePrice, formatPrice, keepUnits } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/products";

type Props = PageProps<"/products/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ locale, t }, product] = await Promise.all([getI18n(), getProductBySlug((await params).slug)]);
  if (!product) return { title: t.meta.notFound };
  return {
    title: localized(locale, product.name, product.nameRu),
    description: localized(locale, product.description, product.descriptionRu).slice(0, 160),
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const [{ locale, t }, product] = await Promise.all([getI18n(), getProductBySlug((await params).slug)]);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category.id, product.id, 5);
  const name = keepUnits(localized(locale, product.name, product.nameRu));
  const description = localized(locale, product.description, product.descriptionRu);
  const categoryName = localized(locale, product.category.name, product.category.nameRu);
  const price = effectivePrice(product);
  const oldPrice = discountPercent(product) > 0 ? product.price : null;
  const off = discountPercent(product);

  const specs = [
    { label: t.product.volume, value: product.volume },
    { label: t.product.pieces, value: product.pieces ? `${product.pieces} ${t.common.pieces}` : null },
    { label: t.product.category, value: categoryName },
    { label: t.product.sku, value: product.sku },
  ].filter((s): s is { label: string; value: string } => Boolean(s.value));

  const buy = { productId: product.id, productName: name, stock: product.stock };

  return (
    <div className="pb-28 pt-3 md:pb-6 md:pt-5">
      <nav className="mb-3 flex items-center gap-1 text-sm text-ink-3" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-ink">
          {t.product.catalog}
        </Link>
        <ChevronRight className="size-4 shrink-0" />
        <Link href={`/products?category=${product.category.slug}`} className="truncate hover:text-ink">
          {categoryName}
        </Link>
      </nav>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_320px]">
        <ProductGallery
          images={product.images}
          name={name}
          badge={
            off > 0 ? (
              <span className="absolute left-4 top-3 rounded-md bg-brand px-2 py-1 text-sm font-bold text-white tabular md:left-3">
                −{off}%
              </span>
            ) : null
          }
        />

        <div className="min-w-0">
          <h1 className="text-balance text-xl font-semibold leading-snug tracking-[-0.01em] md:text-2xl">{name}</h1>

          <div className="mt-3 lg:hidden">
            <PriceBlock price={price} oldPrice={oldPrice} locale={locale} t={t} />
          </div>

          <StockLine stock={product.stock} t={t} />

          <div className="mt-5 hidden md:block lg:hidden">
            <BuyButton {...buy} />
          </div>

          {specs.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-2 text-base font-semibold">{t.product.specs}</h2>
              <dl className="text-sm">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-baseline gap-2 py-1.5">
                    <dt className="shrink-0 text-ink-3">{spec.label}</dt>
                    <span className="min-w-6 flex-1 border-b border-dotted border-line-strong" aria-hidden />
                    <dd className="text-right font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {description && (
            <section className="mt-6">
              <h2 className="mb-2 text-base font-semibold">{t.product.description}</h2>
              <p className="max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{description}</p>
            </section>
          )}

          <ServiceList t={t} className="mt-6 lg:hidden" />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-3">
            <div className="rounded-[var(--radius-card)] bg-surface p-5">
              <PriceBlock price={price} oldPrice={oldPrice} locale={locale} t={t} />
              <div className="mt-5">
                <BuyButton {...buy} />
              </div>
            </div>
            <ServiceList t={t} compact />
          </div>
        </aside>
      </div>

      <ProductPurchase {...buy} unitPrice={price} oldPrice={oldPrice} />

      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeading title={t.product.related} href={`/products?category=${product.category.slug}`} linkLabel={t.home.seeAll} />
          <ProductRail products={related} locale={locale} />
        </section>
      )}
    </div>
  );
}

function PriceBlock({ price, oldPrice, locale, t }: { price: number; oldPrice: number | null; locale: Locale; t: Dictionary }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        <span className={`text-[28px] font-bold leading-none tabular ${oldPrice != null ? "text-brand" : ""}`}>
          {formatPrice(price, locale)}
        </span>
        {oldPrice != null && <span className="text-base text-ink-3 line-through tabular">{formatPrice(oldPrice, locale)}</span>}
      </div>
      {oldPrice != null && (
        <span className="mt-2 inline-block rounded-md bg-brand-soft px-2 py-0.5 text-sm font-medium text-brand">
          {fill(t.product.youSave, { amount: formatPrice(oldPrice - price, locale) })}
        </span>
      )}
    </div>
  );
}

function ServiceList({ t, className, compact }: { t: Dictionary; className?: string; compact?: boolean }) {
  const services = [
    { icon: Truck, title: t.product.deliveryTitle, text: t.product.deliveryText },
    { icon: Store, title: t.product.pickupTitle, text: t.product.pickupText },
    { icon: Wallet, title: t.product.payTitle, text: t.product.payText },
  ];
  return (
    <ul className={`divide-y divide-line rounded-[var(--radius-card)] bg-surface ${className ?? ""}`}>
      {services.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3 px-4 py-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-brand" strokeWidth={1.75} />
          <span>
            <span className="block text-sm font-semibold">{title}</span>
            <span className={`block leading-relaxed text-ink-2 ${compact ? "text-xs" : "text-sm"}`}>{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function StockLine({ stock, t }: { stock: number; t: Dictionary }) {
  if (stock <= 0) return <p className="mt-3 text-sm font-medium text-ink-3">{t.product.outOfStock}</p>;
  const low = stock <= LOW_STOCK_THRESHOLD;
  return (
    <p className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${low ? "text-warning" : "text-success"}`}>
      <span className={`size-2 rounded-full ${low ? "bg-warning" : "bg-success"}`} aria-hidden />
      {low ? fill(t.product.lowStock, { count: stock }) : t.product.inStock}
    </p>
  );
}
