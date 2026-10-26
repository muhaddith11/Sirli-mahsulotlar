"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isUniqueConstraintError } from "@/lib/errors";
import { slugify } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { CATALOG_TAG } from "@/lib/services/products";
import { categoryFormSchema } from "@/lib/validation";
import type { ActionResult } from "./types";

export async function saveCategoryAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categoryFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      error: "Formadagi xatolarni tuzating",
      fieldErrors: Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])),
    };
  }

  const { id, slug, ...rest } = parsed.data;
  const data = {
    ...rest,
    slug: slugify(slug || rest.name) || `kategoriya-${Date.now()}`,
    nameRu: rest.nameRu ?? null,
    volume: rest.volume ?? null,
    collectionName: rest.collectionName ?? null,
    description: rest.description ?? null,
    image: rest.image ?? null,
  };

  try {
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "Bunday slug band", fieldErrors: { slug: "Boshqa slug tanlang" } };
    }
    throw error;
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId } });
  if (count > 0) {
    return { ok: false, error: `Kategoriyada ${count} ta mahsulot bor. Avval ularni boshqa kategoriyaga o'tkazing.` };
  }
  await prisma.category.delete({ where: { id: categoryId } });
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  return { ok: true };
}
