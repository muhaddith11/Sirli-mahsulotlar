"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type StockResult = { ok: true; stock: number } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/", "layout");
}

export async function setStockAction(productId: string, stock: number): Promise<StockResult> {
  await requireAdmin();
  if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
    return { ok: false, error: "Qoldiq 0 yoki undan katta butun son bo'lishi kerak" };
  }
  const product = await prisma.product.update({ where: { id: productId }, data: { stock }, select: { stock: true } });
  revalidate();
  return { ok: true, stock: product.stock };
}

/** Qoldiqni nisbiy o'zgartirish (+1, +10, −1). Manfiyga tushirmaydi. */
export async function adjustStockAction(productId: string, delta: number): Promise<StockResult> {
  await requireAdmin();
  if (!Number.isInteger(delta) || delta === 0) return { ok: false, error: "Noto'g'ri qiymat" };

  const { count } = await prisma.product.updateMany({
    where: { id: productId, ...(delta < 0 && { stock: { gte: -delta } }) },
    data: { stock: { increment: delta } },
  });
  if (count === 0) return { ok: false, error: "Qoldiq manfiy bo'lib qoladi" };

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId }, select: { stock: true } });
  revalidate();
  return { ok: true, stock: product.stock };
}
