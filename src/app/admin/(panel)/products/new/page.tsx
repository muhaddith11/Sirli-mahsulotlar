import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Yangi mahsulot" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" /> Mahsulotlar
      </Link>
      <PageHeader title="Yangi mahsulot" />
      {categories.length === 0 ? (
        <p className="rounded-[var(--radius-card)] bg-surface p-6 text-sm ring-1 ring-line">
          Avval{" "}
          <Link href="/admin/categories" className="font-bold text-brand">
            kategoriya yarating
          </Link>
          .
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </>
  );
}
