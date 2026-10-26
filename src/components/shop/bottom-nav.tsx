"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, House, LayoutGrid, Package, ShoppingCart } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { useCart } from "@/providers/cart-provider";
import { CartBadge } from "./cart-badge";

/** Telefon va Telegram Mini App uchun pastki navigatsiya */
export function BottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { t } = useI18n();

  // useSearchParams ishlatmaymiz: u Suspense talab qiladi va savat belgisi gidratsiyada farq qilib qoladi
  const items = [
    { href: "/", label: t.nav.home, icon: House, active: pathname === "/" },
    { href: "/products", label: t.nav.catalog, icon: LayoutGrid, active: pathname.startsWith("/products") },
    { href: "/products?discounted=1", label: t.nav.discounts, icon: BadgePercent, active: false },
    {
      href: "/cart",
      label: t.nav.cart,
      icon: ShoppingCart,
      active: pathname === "/cart" || pathname.startsWith("/checkout"),
      badge: cart.totalQuantity,
    },
    { href: "/orders", label: t.nav.orders, icon: Package, active: pathname.startsWith("/orders") },
  ];

  return (
    <nav
      aria-label={t.nav.bottomMenu}
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden"
    >
      <ul className="mx-auto grid h-14 max-w-md grid-cols-5">
        {items.map(({ href, label, icon: Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-0.5 whitespace-nowrap text-[10.5px] font-medium transition-colors",
                active ? "text-brand" : "text-ink-3 active:text-ink",
              )}
            >
              <span className="relative">
                <Icon className="size-6" strokeWidth={active ? 2 : 1.75} />
                {badge ? <CartBadge count={badge} className="absolute -right-2.5 -top-1.5" /> : null}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
