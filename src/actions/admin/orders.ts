"use server";

import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDictionary } from "@/i18n";
import { AppError, errorText } from "@/lib/errors";
import { sendOrderStatusNotification, updateOrderStatus } from "@/lib/services/orders";
import { CATALOG_TAG } from "@/lib/services/products";
import { orderStatusSchema } from "@/lib/validation";
import type { ActionResult } from "./types";

export async function updateOrderStatusAction(orderId: string, status: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Noma'lum status" };

  try {
    const order = await updateOrderStatus(orderId, parsed.data);
    if (order) after(() => sendOrderStatusNotification(order));
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: errorText(error, getDictionary("uz")) };
    throw error;
  }

  revalidatePath("/admin", "layout");
  if (parsed.data === "CANCELLED") {
    // qoldiq qaytdi
    updateTag(CATALOG_TAG);
    revalidatePath("/", "layout");
  }
  return { ok: true };
}
