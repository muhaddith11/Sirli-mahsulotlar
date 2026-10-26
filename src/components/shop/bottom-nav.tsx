"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, House, LayoutGrid, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/providers/cart-provider";

/** Mobil qurilmalar va Telegram Mini App uchun pastki navigatsiya */
export function BottomNav() {
  // useSearchParams ishlatmaymiz: u Suspense talab qiladi va savat belgisi gidratsiyada farq qilib qoladi
  const pathname = usePathname();
  const { cart } = useCart();

  const items = [
    { href: "/", label: "Bosh sahifa", icon: House, active: pathname === "/" },
    { href: "/products", label: "Katalog", icon: LayoutGrid, active: pathname.startsWith("/products") },
    { href: "/products?discounted=1", label: "Chegirma", icon: BadgePercent, active: false },
    { href: "/cart", label: "Savat", icon: ShoppingBag, active: pathname === "/cart" || pathname.startsWith("/checkout"), badge: cart.totalQuantity },
  ];

  return (
    <nav
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md md:hidden"
      aria-label="Pastki menyu"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, icon: Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-semibold transition-colors",
                active ? "text-berry-600" : "text-ink-faint",
              )}
            >
              <span className="relative">
                <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 2} />
                {badge ? (
                  <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-berry-600 px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                ) : null}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
