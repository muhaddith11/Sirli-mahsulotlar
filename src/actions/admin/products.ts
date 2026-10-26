"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isUniqueConstraintError } from "@/lib/errors";
import { slugify } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { productFormSchema } from "@/lib/validation";
import type { ActionResult } from "./types";

function revalidateShop() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = base || "mahsulot";
  for (let i = 0; ; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const existing = await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
  }
}

export async function saveProductAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse({
    ...Object.fromEntries(formData),
    images: formData.getAll("images").map(String).filter(Boolean),
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      error: "Formadagi xatolarni tuzating",
      fieldErrors: Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])),
    };
  }

  const { id, slug, ...data } = parsed.data;
  const values = {
    ...data,
    sku: data.sku ?? null,
    nameRu: data.nameRu ?? null,
    descriptionRu: data.descriptionRu ?? null,
    discountPrice: data.discountPrice ?? null,
    volume: data.volume ?? null,
    pieces: data.pieces ?? null,
    slug: await uniqueSlug(slugify(slug || data.name), id),
  };

  try {
    if (id) {
      await prisma.product.update({ where: { id }, data: values });
    } else {
      await prisma.product.create({ data: values });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "Bunday artikul allaqachon mavjud", fieldErrors: { sku: "Artikul band" } };
    }
    throw error;
  }

  revalidateShop();
  redirect("/admin/products");
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  await requireAdmin();
  // Buyurtmalar tarixidagi nom va narxlar saqlanib qoladi (OrderItem.productId → NULL)
  await prisma.product.delete({ where: { id: productId } });
  revalidateShop();
  return { ok: true };
}

export async function toggleProductActiveAction(productId: string): Promise<ActionResult> {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { isActive: true } });
  if (!product) return { ok: false, error: "Mahsulot topilmadi" };
  await prisma.product.update({ where: { id: productId }, data: { isActive: !product.isActive } });
  revalidateShop();
  return { ok: true };
}
