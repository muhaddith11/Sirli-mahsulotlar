import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import { AutoSubmitSelect } from "@/components/shop/auto-submit-select";
import { ProductGrid } from "@/components/shop/product-card";
import { cn } from "@/lib/cn";
import { CATALOG_PAGE_SIZE, PRODUCT_SORTS, PRODUCT_SORT_LABELS } from "@/lib/constants";
import { listCategories, listProducts } from "@/lib/services/products";
import { productQuerySchema, type ProductQuery } from "@/lib/validation";

export const metadata: Metadata = { title: "Katalog" };

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

  const [result, categories] = await Promise.all([listProducts(query), listCategories()]);
  const activeCategory = categories.find((c) => c.slug === query.category);

  const title = query.q
    ? `“${query.q}” bo'yicha`
    : query.discounted
      ? "Chegirmalar"
      : (activeCategory?.name ?? "Barcha mahsulotlar");

  const hasPriceFilter = query.minPrice != null || query.maxPrice != null;

  return (
    <div className="pb-6 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{result.total} ta mahsulot topildi</p>
        </div>
      </div>

      {/* Qidiruv */}
      <form action="/products" id="qidiruv" role="search" className="relative mt-5 scroll-mt-24">
        {query.category && <input type="hidden" name="category" value={query.category} />}
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-faint" />
        <input
          name="q"
          type="search"
          defaultValue={query.q ?? ""}
          placeholder="Masalan: kastryulka 5 L"
          aria-label="Mahsulot qidirish"
          className="h-13 w-full rounded-2xl border border-line bg-white pl-12 pr-28 outline-none transition placeholder:text-ink-faint focus:border-berry-500 focus:ring-4 focus:ring-berry-100"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-ink px-4 text-sm font-bold text-cream hover:bg-berry-700"
        >
          Qidirish
        </button>
      </form>

      {/* Kategoriyalar */}
      <nav className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4" aria-label="Kategoriyalar">
        {[{ slug: undefined, name: "Hammasi" }, ...categories].map((category) => {
          const active = query.category === category.slug && !query.discounted;
          return (
            <Link
              key={category.slug ?? "all"}
              href={catalogHref(query, { category: category.slug, discounted: undefined })}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
                active ? "bg-ink text-cream ring-ink" : "bg-white text-ink-soft ring-line hover:text-ink hover:ring-ink-faint",
              )}
            >
              {category.name}
            </Link>
          );
        })}
        <Link
          href={catalogHref(query, { discounted: query.discounted ? undefined : true })}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
            query.discounted ? "bg-berry-600 text-white ring-berry-600" : "bg-berry-50 text-berry-700 ring-berry-100",
          )}
        >
          % Chegirmalar
        </Link>
      </nav>

      {/* Narx va saralash */}
      <form action="/products" className="mt-4 flex flex-wrap items-center gap-2">
        {query.q && <input type="hidden" name="q" value={query.q} />}
        {query.category && <input type="hidden" name="category" value={query.category} />}
        {query.discounted && <input type="hidden" name="discounted" value="1" />}

        <details className="group relative w-full sm:w-auto" open={hasPriceFilter}>
          <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-line hover:ring-ink-faint [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="size-4" /> Narx
            {hasPriceFilter && <span className="size-2 rounded-full bg-berry-600" />}
          </summary>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:absolute sm:z-10 sm:rounded-2xl sm:bg-white sm:p-3 sm:shadow-xl sm:ring-1 sm:ring-line">
            <input
              name="minPrice"
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              defaultValue={query.minPrice ?? ""}
              placeholder="dan, so'm"
              aria-label="Minimal narx"
              className="h-10 w-32 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-berry-500"
            />
            <span className="text-ink-faint">—</span>
            <input
              name="maxPrice"
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              defaultValue={query.maxPrice ?? ""}
              placeholder="gacha, so'm"
              aria-label="Maksimal narx"
              className="h-10 w-32 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-berry-500"
            />
            <button type="submit" className="h-10 rounded-xl bg-ink px-4 text-sm font-bold text-cream hover:bg-berry-700">
              Qo&apos;llash
            </button>
            {hasPriceFilter && (
              <Link
                href={catalogHref(query, { minPrice: undefined, maxPrice: undefined })}
                className="px-2 text-sm font-semibold text-berry-600"
              >
                Tozalash
              </Link>
            )}
          </div>
        </details>

        <label className="ml-auto flex items-center gap-2 text-sm text-ink-soft">
          <span className="hidden sm:inline">Saralash:</span>
          <AutoSubmitSelect
            name="sort"
            defaultValue={query.sort}
            className="h-10 rounded-full border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-berry-500"
          >
            {PRODUCT_SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {PRODUCT_SORT_LABELS[sort]}
              </option>
            ))}
          </AutoSubmitSelect>
        </label>
      </form>

      <div className="mt-6">
        {result.items.length > 0 ? (
          <ProductGrid products={result.items} />
        ) : (
          <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-line">
            <PackageSearch className="size-12 text-berry-200" />
            <p className="mt-4 font-display text-xl font-semibold">Hech narsa topilmadi</p>
            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              Boshqa so&apos;z bilan qidirib ko&apos;ring yoki filtrlarni tozalang.
            </p>
            <Link href="/products" className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream">
              Barcha mahsulotlar
            </Link>
          </div>
        )}
      </div>

      {result.totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Sahifalar">
          <PageLink href={catalogHref(query, { page: query.page - 1 })} disabled={query.page <= 1} label="Oldingi">
            <ChevronLeft className="size-5" />
          </PageLink>
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={catalogHref(query, { page })}
              aria-current={page === query.page ? "page" : undefined}
              className={cn(
                "grid size-10 place-items-center rounded-full text-sm font-bold",
                page === query.page ? "bg-ink text-cream" : "bg-white ring-1 ring-line hover:ring-ink-faint",
              )}
            >
              {page}
            </Link>
          ))}
          <PageLink
            href={catalogHref(query, { page: query.page + 1 })}
            disabled={query.page >= result.totalPages}
            label="Keyingi"
          >
            <ChevronRight className="size-5" />
          </PageLink>
        </nav>
      )}
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="grid size-10 place-items-center rounded-full text-ink-faint/50" aria-hidden>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-line">
      {children}
    </Link>
  );
}
