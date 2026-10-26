import Link from "next/link";
import type { CategoryWithCount } from "@/lib/services/products";
import { ProductImage } from "./product-image";

/** Ommabop kategoriyalar: mobilda gorizontal aylantiriladi, kompyuterda — panjara */
export function CategoryRail({ categories }: { categories: CategoryWithCount[] }) {
  return (
    <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className="group w-36 shrink-0 snap-start rounded-3xl bg-white p-2 ring-1 ring-line transition hover:ring-berry-200 md:w-auto"
        >
          <div className="aspect-square overflow-hidden rounded-[1.25rem] bg-cream-deep">
            <ProductImage
              src={category.image}
              alt={category.name}
              className="size-full transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="px-1.5 pb-1 pt-2.5">
            <p className="truncate text-sm font-bold">{category.name}</p>
            <p className="text-xs text-ink-faint">
              {category._count.products} ta mahsulot{category.volume && ` · ${category.volume}`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
