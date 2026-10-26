import Link from "next/link";
import { Send, Store, Truck } from "lucide-react";
import { localized, type Dictionary, type Locale } from "@/i18n";
import type { HeaderCategory } from "./header";
import { Logo } from "./logo";

type Props = { t: Dictionary; locale: Locale; categories: HeaderCategory[]; botUrl: string | null };

export function Footer({ t, locale, categories, botUrl }: Props) {
  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-6">
        <div className="space-y-3">
          <Logo label={t.nav.homeLabel} />
          <p className="max-w-xs text-sm leading-relaxed text-ink-2">{t.footer.about}</p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.catalog}</h2>
          <ul className="space-y-2 text-sm text-ink-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link className="hover:text-brand" href={`/products?category=${category.slug}`}>
                  {localized(locale, category.name, category.nameRu)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.buyers}</h2>
          <ul className="space-y-2.5 text-sm text-ink-2">
            <li className="flex items-center gap-2">
              <Send className="size-4 shrink-0 text-ink-3" />
              {botUrl ? (
                <a href={botUrl} className="hover:text-brand" target="_blank" rel="noreferrer">
                  {t.footer.howToOrder}
                </a>
              ) : (
                t.footer.howToOrder
              )}
            </li>
            <li className="flex items-center gap-2">
              <Truck className="size-4 shrink-0 text-ink-3" />
              {t.footer.delivery}
            </li>
            <li className="flex items-center gap-2">
              <Store className="size-4 shrink-0 text-ink-3" />
              {t.footer.pickup}
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-ink-3">
        © {new Date().getFullYear()} {t.footer.rights}
      </p>
    </footer>
  );
}
