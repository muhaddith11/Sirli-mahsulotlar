"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ClipboardList, CreditCard, LayoutDashboard, Package, Sparkles, Tags, TicketPercent, Truck } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/admin", label: "Boshqaruv", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Buyurtmalar", icon: ClipboardList, badgeKey: "newOrders" as const },
  { href: "/admin/products", label: "Mahsulotlar", icon: Package },
  { href: "/admin/showcase", label: "Vitrina", icon: Sparkles },
  { href: "/admin/inventory", label: "Ombor", icon: Boxes, badgeKey: "lowStock" as const },
  { href: "/admin/categories", label: "Kategoriyalar", icon: Tags },
  { href: "/admin/delivery", label: "Yetkazib berish", icon: Truck },
  { href: "/admin/payment", label: "To'lov", icon: CreditCard },
  { href: "/admin/promo", label: "Promokodlar", icon: TicketPercent },
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
              "flex shrink-0 items-center gap-3 rounded-[var(--radius-field)] text-sm font-semibold transition",
              orientation === "vertical" ? "px-3 py-2.5" : "px-3.5 py-2",
              active ? "bg-ink text-white" : "text-ink-2 hover:bg-page hover:text-ink",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
            {badge > 0 && (
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold",
                  active ? "bg-surface/20 text-white" : badgeKey === "newOrders" ? "bg-info-soft text-info" : "bg-warning-soft text-warning",
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
