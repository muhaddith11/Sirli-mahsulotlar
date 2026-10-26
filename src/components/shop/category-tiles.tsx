import Link from "next/link";
import { fill, localized, type Dictionary, type Locale } from "@/i18n";
import type { CategoryWithCount } from "@/lib/services/products";
import { ProductImage } from "./product-image";

type Props = { categories: CategoryWithCount[]; locale: Locale; t: Dictionary };

/** Bosh sahifadagi kategoriyalar: telefonda 3 ustun, kompyuterda 6 ustun */
export function CategoryTiles({ categories, locale, t }: Props) {
  return (
    <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:grid-cols-6 md:gap-x-4">
      {categories.map((category) => {
        const name = localized(locale, category.name, category.nameRu);
        return (
          <li key={category.id}>
            <Link href={`/products?category=${category.slug}`} className="group block">
              <span className="block overflow-hidden rounded-[var(--radius-card)] bg-cream">
                <ProductImage
                  src={category.image}
                  alt=""
                  className="aspect-square w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />
              </span>
              <span className="mt-2 block truncate text-[13px] font-semibold leading-tight text-ink md:text-sm">
                {name}
              </span>
              <span className="block text-xs text-ink-3">
                {fill(t.home.itemsCount, { count: category._count.products })}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
