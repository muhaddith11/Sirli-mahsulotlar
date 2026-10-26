"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isUniqueConstraintError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { normalizePromoCode } from "@/lib/services/promo";
import type { ActionResult } from "./types";

const optionalInt = (min: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().int("Butun son kiriting").min(min).nullable(),
  );
const optionalDate = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.coerce.date({ error: "Sana noto'g'ri" }).nullable(),
);

const promoSchema = z
  .object({
    code: z
      .string()
      .transform(normalizePromoCode)
      .pipe(z.string().regex(/^[A-Z0-9_-]{3,32}$/, "3–32 ta lotin harfi, raqam, - yoki _")),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number({ error: "Qiymatni kiriting" }).int("Butun son kiriting").min(1, "0 dan katta bo'lsin"),
    minOrder: optionalInt(0),
    maxUses: optionalInt(1),
    startsAt: optionalDate,
    endsAt: optionalDate,
  })
  .refine((d) => d.type !== "PERCENT" || d.value <= 90, { path: ["value"], message: "Foiz 1–90 oralig'ida" })
  .refine((d) => !d.startsAt || !d.endsAt || d.startsAt < d.endsAt, { path: ["endsAt"], message: "Tugash sanasi boshlanishdan keyin" });

export async function createPromoAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = promoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      error: "Formadagi xatolarni tuzating",
      fieldErrors: Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])),
    };
  }

  try {
    await prisma.promoCode.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { ok: false, error: "Bunday promokod bor", fieldErrors: { code: "Band" } };
    throw error;
  }
  revalidatePath("/admin/promo");
  return { ok: true };
}

export async function togglePromoAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const promo = await prisma.promoCode.findUnique({ where: { id }, select: { isActive: true } });
  if (!promo) return { ok: false, error: "Promokod topilmadi" };
  await prisma.promoCode.update({ where: { id }, data: { isActive: !promo.isActive } });
  revalidatePath("/admin/promo");
  return { ok: true };
}

export async function deletePromoAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  // Buyurtmalarda kod matni (promoCodeText) saqlanib qoladi
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promo");
  return { ok: true };
}
