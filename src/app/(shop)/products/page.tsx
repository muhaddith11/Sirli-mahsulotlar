import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { AutoSubmitSelect } from "@/components/shop/auto-submit-select";
import { FilterSheet } from "@/components/shop/filter-sheet";
import { ProductGrid } from "@/components/shop/product-card";
import { fill, localized, plural, type Dictionary } from "@/i18n";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { CATALOG_PAGE_SIZE, PRODUCT_SORTS } from "@/lib/constants";
import { listCategories, listProducts } from "@/lib/services/products";
import { productQuerySchema, type ProductQuery } from "@/lib/validation";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.catalog };
}

type QueryOverrides = { [K in keyof ProductQuery]?: ProductQuery[K] | undefined };

function catalogHref(query: ProductQuery, overrides: QueryOverrides = {}) {
  const merged: QueryOverrides = { ...query, page: undefined, ...overrides };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (key === "limit" || value === undefined || value === false || value === "") continue;
    if (key === "sort" && value === "popular") continue;
    if (key === "page" && value === 1) continue;
    params.set(key, value === true ? "1" : String(value));
  }
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const raw = await searchParams;
  const flat = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const parsed = productQuerySchema.safeParse({ ...flat, limit: CATALOG_PAGE_SIZE });
  const query = parsed.success ? parsed.data : productQuerySchema.parse({ limit: CATALOG_PAGE_SIZE });

  const [{ locale, t }, result, categories] = await Promise.all([getI18n(), listProducts(query), listCategories()]);
  const activeCategory = categories.find((c) => c.slug === query.category);

  const title = query.q
    ? fill(t.catalog.searchResults, { query: query.q })
    : query.discounted
      ? t.catalog.discounted
      : activeCategory
        ? localized(locale, activeCategory.name, activeCategory.nameRu)
        : t.catalog.allProducts;

  const hasPriceFilter = query.minPrice != null || query.maxPrice != null;
  const hasFilters = hasPriceFilter || Boolean(query.category) || Boolean(query.discounted) || Boolean(query.q);

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-colors",
      active ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-ink hover:border-ink-3",
    );

  const priceForm = <PriceForm query={query} t={t} />;

  return (
    <div className="pb-6 pt-4 md:pt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-[-0.02em] md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-ink-3">
          {fill(plural(locale, result.total, t.catalog.found), { count: result.total })}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[232px_1fr] lg:gap-8">
        {/* Kompyuterda: chap panel */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-6">
            <nav aria-label={t.catalog.categories}>
              <h2 className="mb-2 text-sm font-semibold">{t.catalog.categories}</h2>
              <ul className="space-y-0.5 text-sm">
                <li>
                  <Link
                    href={catalogHref(query, { category: undefined, discounted: undefined })}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-surface",
                      !query.category && !query.discounted ? "bg-surface font-semibold text-ink" : "text-ink-2",
                    )}
                  >
                    {t.common.all}
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={catalogHref(query, { category: category.slug, discounted: undefined })}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-surface",
                        query.category === category.slug ? "bg-surface font-semibold text-ink" : "text-ink-2",
                      )}
                    >
                      {localized(locale, category.name, category.nameRu)}
                      <span className="text-xs text-ink-3 tabular">{category._count.products}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={catalogHref(query, { discounted: query.discounted ? undefined : true })}
                    className={cn(
                      "flex items-center rounded-lg px-2.5 py-2 font-medium text-brand hover:bg-brand-soft",
                      query.discounted && "bg-brand-soft",
                    )}
                  >
                    {t.catalog.discounted}
                  </Link>
                </li>
              </ul>
            </nav>
            <div>
              <h2 className="mb-2 text-sm font-semibold">{t.catalog.price}</h2>
              {priceForm}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Telefonda: kategoriya chiplari */}
          <nav aria-label={t.catalog.categories} className="scrollbar-none -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 lg:hidden">
            <Link href={catalogHref(query, { category: undefined, discounted: undefined })} className={chip(!query.category && !query.discounted)}>
              {t.common.all}
            </Link>
            <Link
              href={catalogHref(query, { discounted: query.discounted ? undefined : true })}
              className={cn(chip(Boolean(query.discounted)), !query.discounted && "text-brand")}
            >
              {t.catalog.discounted}
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={catalogHref(query, { category: category.slug, discounted: undefined })}
                className={chip(query.category === category.slug)}
              >
                {localized(locale, category.name, category.nameRu)}
              </Link>
            ))}
          </nav>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <FilterSheet active={hasPriceFilter}>{priceForm}</FilterSheet>
            <form action="/products" className="ml-auto">
              {query.q && <input type="hidden" name="q" value={query.q} />}
              {query.category && <input type="hidden" name="category" value={query.category} />}
              {query.discounted && <input type="hidden" name="discounted" value="1" />}
              {query.minPrice != null && <input type="hidden" name="minPrice" value={query.minPrice} />}
              {query.maxPrice != null && <input type="hidden" name="maxPrice" value={query.maxPrice} />}
              <AutoSubmitSelect name="sort" defaultValue={query.sort} aria-label={t.catalog.sort}>
                {PRODUCT_SORTS.map((sort) => (
                  <option key={sort} value={sort}>
                    {t.catalog.sorts[sort]}
                  </option>
                ))}
              </AutoSubmitSelect>
            </form>
          </div>

          {result.items.length > 0 ? (
            <ProductGrid products={result.items} locale={locale} withSidebar />
          ) : (
            <div className="flex flex-col items-center rounded-[var(--radius-card)] bg-surface px-6 py-14 text-center">
              <PackageSearch className="size-12 text-ink-3" strokeWidth={1.5} />
              <p className="mt-4 text-lg font-semibold">{t.catalog.notFoundTitle}</p>
              <p className="mt-1 max-w-sm text-sm text-ink-2">{t.catalog.notFoundText}</p>
              {hasFilters && (
                <Link
                  href="/products"
                  className="mt-5 inline-flex h-10 items-center rounded-[var(--radius-field)] bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover"
                >
                  {t.catalog.resetFilters}
                </Link>
              )}
            </div>
          )}

          {result.totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label={t.catalog.pages}>
              <PageLink href={catalogHref(query, { page: query.page - 1 })} disabled={query.page <= 1} label={t.catalog.prev}>
                <ChevronLeft className="size-5" />
              </PageLink>
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={catalogHref(query, { page })}
                  aria-current={page === query.page ? "page" : undefined}
                  className={cn(
                    "grid size-10 place-items-center rounded-[var(--radius-field)] text-sm font-semibold tabular",
                    page === query.page ? "bg-ink text-white" : "bg-surface text-ink hover:bg-cream",
                  )}
                >
                  {page}
                </Link>
              ))}
              <PageLink
                href={catalogHref(query, { page: query.page + 1 })}
                disabled={query.page >= result.totalPages}
                label={t.catalog.next}
              >
                <ChevronRight className="size-5" />
              </PageLink>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function PriceForm({ query, t }: { query: ProductQuery; t: Dictionary }) {
  const field =
    "h-10 w-full min-w-0 rounded-[var(--radius-field)] border border-line-strong bg-surface px-3 text-sm tabular outline-none placeholder:text-ink-3 focus:border-brand";
  return (
    <form action="/products" className="space-y-3">
      {query.q && <input type="hidden" name="q" value={query.q} />}
      {query.category && <input type="hidden" name="category" value={query.category} />}
      {query.discounted && <input type="hidden" name="discounted" value="1" />}
      {query.sort !== "popular" && <input type="hidden" name="sort" value={query.sort} />}
      <div className="flex items-center gap-2">
        <input
          name="minPrice"
          type="number"
          min={0}
          step={1000}
          inputMode="numeric"
          defaultValue={query.minPrice ?? ""}
          placeholder={t.catalog.priceFrom}
          aria-label={t.catalog.minPrice}
          className={field}
        />
        <span className="text-ink-3">—</span>
        <input
          name="maxPrice"
          type="number"
          min={0}
          step={1000}
          inputMode="numeric"
          defaultValue={query.maxPrice ?? ""}
          placeholder={t.catalog.priceTo}
          aria-label={t.catalog.maxPrice}
          className={field}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="h-10 flex-1 rounded-[var(--radius-field)] bg-brand text-sm font-semibold text-white hover:bg-brand-hover">
          {t.catalog.apply}
        </button>
        {(query.minPrice != null || query.maxPrice != null) && (
          <Link
            href={catalogHref(query, { minPrice: undefined, maxPrice: undefined })}
            className="inline-flex h-10 items-center rounded-[var(--radius-field)] px-3 text-sm font-medium text-ink-2 hover:bg-page"
          >
            {t.catalog.clear}
          </Link>
        )}
      </div>
    </form>
  );
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  if (disabled) {
    return (
      <span className="grid size-10 place-items-center text-ink-3/40" aria-hidden>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className="grid size-10 place-items-center rounded-[var(--radius-field)] bg-surface hover:bg-cream">
      {children}
    </Link>
  );
}
