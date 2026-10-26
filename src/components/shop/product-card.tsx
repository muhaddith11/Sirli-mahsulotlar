import Link from "next/link";
import { cn } from "@/lib/cn";
import { discountPercent, effectivePrice, formatPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/services/products";
import { AddToCartIconButton } from "./add-to-cart-button";
import { ProductImage } from "./product-image";

export function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const soldOut = product.stock <= 0;
  const href = `/products/${product.slug}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-line transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(42,30,23,0.35)]">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-cream-deep" tabIndex={-1}>
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          className={cn("size-full transition duration-500 group-hover:scale-[1.04]", soldOut && "opacity-60 grayscale-[35%]")}
        />
        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-berry-600 px-2.5 py-1 text-xs font-extrabold text-white">
            −{off}%
          </span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-cream">
            Omborda yo&apos;q
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-ink-faint">
          {product.category.name}
          {product.volume && ` · ${product.volume}`}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug sm:text-[15px]">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            {off > 0 && <p className="text-xs text-ink-faint line-through">{formatPrice(product.price)}</p>}
            <p className={cn("text-[15px] font-extrabold sm:text-base", off > 0 ? "text-berry-600" : "text-ink")}>
              {formatPrice(price)}
            </p>
          </div>
          <div className="relative z-10">
            <AddToCartIconButton productId={product.id} productName={product.name} disabled={soldOut} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
