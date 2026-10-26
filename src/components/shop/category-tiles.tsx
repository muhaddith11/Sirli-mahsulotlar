import Link from "next/link";
import { fill, localized, type Dictionary, type Locale } from "@/i18n";
import type { CategoryWithCount } from "@/lib/services/products";
import { ProductImage } from "./product-image";

type Props = { categories: CategoryWithCount[]; locale: Locale; t: Dictionary };

/**
 * Bosh sahifadagi kategoriyalar: telefonda bitta ixcham gorizontal qator
 * (birinchi ekranda chegirmalar ham ko'rinsin), kattaroq ekranda — panjara.
 */
export function CategoryTiles({ categories, locale, t }: Props) {
  return (
    <ul className="scrollbar-none -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-x-3 sm:gap-y-4 sm:overflow-visible sm:px-0 md:grid-cols-6 md:gap-x-4">
      {categories.map((category) => {
        const name = localized(locale, category.name, category.nameRu);
        return (
          <li key={category.id} className="w-[84px] shrink-0 snap-start sm:w-auto">
            <Link href={`/products?category=${category.slug}`} className="group block">
              <span className="block overflow-hidden rounded-[var(--radius-card)] bg-cream">
                <ProductImage
                  src={category.image}
                  alt=""
                  className="aspect-square w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />
              </span>
              <span className="mt-1.5 block truncate text-center text-xs font-medium leading-tight text-ink sm:mt-2 sm:text-left sm:text-[13px] sm:font-semibold md:text-sm">
                {name}
              </span>
              <span className="hidden text-xs text-ink-3 sm:block">
                {fill(t.home.itemsCount, { count: category._count.products })}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
