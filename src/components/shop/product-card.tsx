import Link from "next/link";
import { localized, type Locale } from "@/i18n";
import { cn } from "@/lib/cn";
import { discountPercent, effectivePrice, formatPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/services/products";
import { CartControl } from "./cart-control";
import { ProductImage } from "./product-image";

type Props = { product: ProductCardData; locale: Locale; priority?: boolean; className?: string };

export function ProductCard({ product, locale, priority, className }: Props) {
  const name = localized(locale, product.name, product.nameRu);
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const soldOut = product.stock <= 0;
  const href = `/products/${product.slug}`;

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link href={href} className="relative block overflow-hidden rounded-[var(--radius-card)] bg-cream" tabIndex={-1} aria-hidden>
        <ProductImage
          src={product.images[0]}
          alt=""
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "aspect-[4/5] w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]",
            soldOut && "opacity-55",
          )}
        />
        {off > 0 && !soldOut && (
          <span className="absolute left-2 top-2 rounded-md bg-brand px-1.5 py-0.5 text-xs font-bold text-white tabular">
            −{off}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-0.5 pt-2.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <span className={cn("text-[17px] font-bold leading-tight tabular", off > 0 ? "text-brand" : "text-ink")}>
            {formatPrice(price, locale)}
          </span>
          {off > 0 && (
            <span className="text-xs text-ink-3 line-through tabular">{formatPrice(product.price, locale)}</span>
          )}
        </div>
        <h3 className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-2">
          <Link href={href} className="hover:text-ink">
            {name}
          </Link>
        </h3>
        <div className="mt-auto pt-2.5">
          <CartControl productId={product.id} productName={name} stock={product.stock} />
        </div>
      </div>
    </article>
  );
}

type GridProps = { products: ProductCardData[]; locale: Locale; withSidebar?: boolean };

export function ProductGrid({ products, locale, withSidebar }: GridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-4",
        withSidebar ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-4 xl:grid-cols-5",
      )}
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} locale={locale} priority={i < 4} />
      ))}
    </div>
  );
}

/** Telefonda gorizontal aylanadigan qator, kompyuterda — panjara */
export function ProductRail({ products, locale }: { products: ProductCardData[]; locale: Locale }) {
  return (
    <div
      className={cn(
        "scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1",
        "sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-4 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-5",
        // Kattaroq ekranda faqat bitta to'liq qator: ortiqchasi yashiriladi (tab tartibidan ham chiqadi)
        "sm:[&>*:nth-child(n+4)]:hidden lg:[&>*:nth-child(n+4)]:flex lg:[&>*:nth-child(n+5)]:hidden xl:[&>*:nth-child(n+5)]:flex xl:[&>*:nth-child(n+6)]:hidden",
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} className="w-[44vw] max-w-48 shrink-0 snap-start sm:w-auto sm:max-w-none" />
      ))}
    </div>
  );
}
