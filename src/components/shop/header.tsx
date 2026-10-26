"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ShoppingCart } from "lucide-react";
import { localized } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { useCart } from "@/providers/cart-provider";
import { CartBadge } from "./cart-badge";
import { LanguageSwitch } from "./language-switch";
import { Logo } from "./logo";
import { SearchField } from "./search-field";

export type HeaderCategory = { id: string; name: string; nameRu: string | null; slug: string };

export function Header({ categories }: { categories: HeaderCategory[] }) {
  const { t, locale } = useI18n();
  const { cart } = useCart();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 md:h-[72px] md:gap-4 lg:px-6">
        <Logo label={t.nav.homeLabel} />

        <Link
          href="/products"
          className="hidden h-11 shrink-0 items-center gap-2 rounded-[var(--radius-field)] bg-brand px-4 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover active:bg-brand-press md:inline-flex"
        >
          <LayoutGrid className="size-[18px]" strokeWidth={2} />
          {t.nav.catalog}
        </Link>

        <SearchField className="flex-1" size="lg" />

        <span className="hidden md:contents">
          <LanguageSwitch />
        </span>
        <span className="contents md:hidden">
          <LanguageSwitch variant="toggle" />
        </span>

        <Link
          href="/cart"
          aria-label={fillCount(t.nav.cartLabel, cart.totalQuantity)}
          className={cn(
            "relative hidden h-11 shrink-0 items-center gap-2 rounded-[var(--radius-field)] px-3 text-[15px] font-medium transition-colors hover:bg-page md:inline-flex",
            pathname === "/cart" ? "text-brand" : "text-ink",
          )}
        >
          <span className="relative">
            <ShoppingCart className="size-6" strokeWidth={1.75} />
            <CartBadge count={cart.totalQuantity} className="absolute -right-2.5 -top-2" />
          </span>
          {t.nav.cart}
        </Link>
      </div>

      <nav aria-label={t.nav.mainMenu} className="mx-auto hidden max-w-7xl px-4 md:block lg:px-6">
        <ul className="scrollbar-none -mx-1 flex h-10 items-center gap-1 overflow-x-auto text-sm">
          <li>
            <Link
              href="/products?discounted=1"
              className="block whitespace-nowrap rounded-full px-3 py-1.5 font-semibold text-brand hover:bg-brand-soft"
            >
              {t.nav.discounts}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/products?category=${category.slug}`}
                className="block whitespace-nowrap rounded-full px-3 py-1.5 text-ink-2 hover:bg-page hover:text-ink"
              >
                {localized(locale, category.name, category.nameRu)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </header>
  );
}

function fillCount(template: string, count: number) {
  return template.replace("{count}", String(count));
}
