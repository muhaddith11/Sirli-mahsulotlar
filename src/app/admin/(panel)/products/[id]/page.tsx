import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Mahsulotni tahrirlash" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" /> Mahsulotlar
      </Link>
      <PageHeader
        title="Tahrirlash"
        description={product.name}
        action={
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand"
          >
            Do&apos;konda ko&apos;rish <ExternalLink className="size-4" />
          </Link>
        }
      />
      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          nameRu: product.nameRu,
          slug: product.slug,
          sku: product.sku,
          categoryId: product.categoryId,
          description: product.description,
          descriptionRu: product.descriptionRu,
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock,
          volume: product.volume,
          pieces: product.pieces,
          images: product.images,
          spinFrames: product.spinFrames,
          spinCutout: product.spinCutout,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        }}
      />
    </>
  );
}
