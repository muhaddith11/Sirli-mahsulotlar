import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Toaster } from "sonner";
import { logoutAction } from "@/actions/admin/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { PotMark } from "@/components/shop/logo";
import { requireAdmin } from "@/lib/auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const [newOrders, lowStock] = await Promise.all([
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } } }),
  ]);
  const badges = { newOrders, lowStock };

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-berry-600 text-cream">
        <PotMark className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-base font-semibold italic">Sirli</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">Admin panel</span>
      </span>
    </Link>
  );

  const logout = (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-berry-50 hover:text-berry-700"
      >
        <LogOut className="size-[18px]" /> <span className="max-lg:sr-only">Chiqish</span>
      </button>
    </form>
  );

  return (
    <div className="min-h-dvh bg-[#f7f2ea] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-line bg-white p-4 lg:flex">
        {brand}
        <AdminNav badges={badges} orientation="vertical" />
        <div className="mt-auto space-y-1 border-t border-line pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-cream-deep hover:text-ink"
          >
            <ExternalLink className="size-[18px]" /> Do&apos;konni ochish
          </Link>
          {logout}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 space-y-3 border-b border-line bg-white/95 px-4 pb-3 pt-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            {brand}
            {logout}
          </div>
          <AdminNav badges={badges} orientation="horizontal" />
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
