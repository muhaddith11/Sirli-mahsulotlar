import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryTiles } from "@/components/shop/category-tiles";
import { ProductGrid, ProductRail } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/shop/section-heading";
import { ServiceStrip } from "@/components/shop/service-strip";
import { getI18n } from "@/i18n/server";
import { listCategories, listProducts } from "@/lib/services/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ locale, t }, categories, discounted, popular] = await Promise.all([
    getI18n(),
    listCategories(),
    listProducts({ discounted: true, limit: 10, sort: "popular" }),
    listProducts({ limit: 15, sort: "popular" }),
  ]);
  const sets = categories.find((category) => category.dishType === "SET");

  return (
    <div className="space-y-8 pb-6 pt-4 md:space-y-12 md:pt-6">
      {categories.length > 0 && (
        <section aria-labelledby="home-categories">
          <h1 id="home-categories" className="sr-only">
            {t.home.categories}
          </h1>
          <CategoryTiles categories={categories} locale={locale} t={t} />
        </section>
      )}

      <ServiceStrip t={t} />

      {sets?.image && (
        <Link
          href={`/products?category=${sets.slug}`}
          className="group relative grid min-h-36 grid-cols-[1fr_auto] items-center overflow-hidden rounded-[var(--radius-card)] bg-brand text-white md:min-h-48"
        >
          <span className="relative z-10 min-w-0 py-5 pl-5 pr-2 md:px-10">
            <span className="block text-lg font-bold leading-tight tracking-[-0.02em] sm:text-xl md:text-3xl">{t.home.setsTitle}</span>
            <span className="mt-1.5 block max-w-sm text-[13px] leading-snug text-white/85 sm:text-sm md:text-base">{t.home.setsText}</span>
            <span className="mt-4 inline-flex h-10 items-center gap-1 whitespace-nowrap rounded-[var(--radius-field)] bg-white px-4 text-sm font-semibold text-brand transition-colors group-hover:bg-cream">
              {t.home.setsCta}
              <ChevronRight className="size-4" />
            </span>
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sets.image}
            alt=""
            className="h-full max-h-56 w-28 object-cover sm:w-56 md:w-80"
            loading="lazy"
          />
        </Link>
      )}

      {discounted.items.length > 0 && (
        <section>
          <SectionHeading title={t.home.discounts} href="/products?discounted=1" linkLabel={t.home.seeAll} />
          <ProductRail products={discounted.items} locale={locale} />
        </section>
      )}

      <section>
        <SectionHeading title={t.home.popular} href="/products" linkLabel={t.home.seeAll} />
        {popular.items.length > 0 ? (
          <ProductGrid products={popular.items} locale={locale} />
        ) : (
          <p className="rounded-[var(--radius-card)] bg-surface p-8 text-center text-ink-2">{t.home.empty}</p>
        )}
      </section>
    </div>
  );
}
