"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ClipboardList, LayoutDashboard, Package, Tags } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/admin", label: "Boshqaruv", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Buyurtmalar", icon: ClipboardList, badgeKey: "newOrders" as const },
  { href: "/admin/products", label: "Mahsulotlar", icon: Package },
  { href: "/admin/inventory", label: "Ombor", icon: Boxes, badgeKey: "lowStock" as const },
  { href: "/admin/categories", label: "Kategoriyalar", icon: Tags },
];

type Badges = { newOrders: number; lowStock: number };

export function AdminNav({ badges, orientation }: { badges: Badges; orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin menyu"
      className={cn(
        orientation === "vertical" ? "flex flex-col gap-1" : "scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4",
      )}
    >
      {ITEMS.map(({ href, label, icon: Icon, exact, badgeKey }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const badge = badgeKey ? badges[badgeKey] : 0;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl text-sm font-semibold transition",
              orientation === "vertical" ? "px-3 py-2.5" : "px-3.5 py-2",
              active ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream-deep hover:text-ink",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
            {badge > 0 && (
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold",
                  active ? "bg-cream/20 text-cream" : badgeKey === "newOrders" ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800",
                )}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
