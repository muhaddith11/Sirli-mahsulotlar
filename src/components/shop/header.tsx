"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/providers/cart-provider";
import { Logo } from "./logo";

const NAV = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/products", label: "Katalog" },
  { href: "/products?discounted=1", label: "Chegirmalar" },
];

export function Header() {
  const pathname = usePathname();
  const { cart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Asosiy menyu">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : item.href === "/products" && pathname.startsWith("/products");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream-deep hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action="/products" className="relative ml-auto hidden w-72 lg:block" role="search">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            name="q"
            type="search"
            placeholder="Kastryulka, choynak, to'plam…"
            aria-label="Mahsulot qidirish"
            className="h-10 w-full rounded-full border border-line bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-ink-faint focus:border-berry-500 focus:ring-4 focus:ring-berry-100"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link
            href="/products#qidiruv"
            className="grid size-10 place-items-center rounded-full text-ink hover:bg-cream-deep lg:hidden"
            aria-label="Qidirish"
          >
            <Search className="size-5" />
          </Link>
          <Link
            href="/cart"
            className="relative grid size-10 place-items-center rounded-full text-ink hover:bg-cream-deep"
            aria-label={`Savat, ${cart.totalQuantity} ta mahsulot`}
          >
            <ShoppingBag className="size-5" />
            {cart.totalQuantity > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-berry-600 px-1 text-[11px] font-bold text-white ring-2 ring-cream">
                {cart.totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
