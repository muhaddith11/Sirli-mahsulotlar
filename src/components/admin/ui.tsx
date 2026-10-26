import Link from "next/link";
import type { OrderStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";
import { LOW_STOCK_THRESHOLD, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/constants";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[var(--radius-card)] bg-white ring-1 ring-line", className)}>{children}</div>;
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1", ORDER_STATUS_STYLES[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  const style =
    stock <= 0
      ? "bg-brand-soft text-brand"
      : stock <= LOW_STOCK_THRESHOLD
        ? "bg-amber-100 text-amber-800"
        : "bg-emerald-100 text-emerald-800";
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold tabular-nums", style)}>
      {stock <= 0 ? "Tugagan" : `${stock} dona`}
    </span>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-field)] bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
    >
      {children}
    </Link>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[var(--radius-card)] bg-white p-10 text-center text-sm text-ink-2 ring-1 ring-line">{children}</p>;
}

/** Admin ro'yxatlari uchun sahifalash */
export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (page: number) => string }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-6 flex flex-wrap justify-center gap-1.5" aria-label="Sahifalar">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "grid size-9 place-items-center rounded-lg text-sm font-bold",
            p === page ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-line-strong",
          )}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
