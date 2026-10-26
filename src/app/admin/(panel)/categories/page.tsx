import type { Metadata } from "next";
import { CategoryList } from "@/components/admin/category-list";
import { PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Kategoriyalar" };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <PageHeader title="Kategoriyalar" description="Idish turlari va to'plamlar" />
      <CategoryList
        categories={categories.map(({ _count, createdAt: _c, updatedAt: _u, ...category }) => ({
          ...category,
          productCount: _count.products,
        }))}
      />
    </>
  );
}
