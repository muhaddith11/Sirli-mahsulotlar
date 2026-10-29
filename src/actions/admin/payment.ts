"use server";

import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SETTINGS_TAG } from "@/lib/services/delivery";
import { setPaymentResult, sendPaymentResultNotification } from "@/lib/services/payments";
import { deleteUploads } from "@/lib/uploads";
import type { ActionResult } from "./types";

const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const paymentSettingsSchema = z.object({
  cardNumber: z.preprocess(
    (v) => (typeof v === "string" ? v.replace(/\D/g, "") || null : v),
    z.string().regex(/^\d{16}$/, "Karta raqami 16 ta raqamdan iborat bo'lsin").nullable(),
  ),
  cardHolder: z.preprocess(blank, z.string().trim().max(60, "Ism juda uzun").nullable()),
  paymentQr: z.preprocess(blank, z.string().trim().max(500).regex(/^(https:\/\/|\/)/, "QR rasm manzili noto'g'ri").nullable()),
});

/** Kartaga o'tkazma rekvizitlari: karta raqami, egasi va QR kodi */
export async function savePaymentSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = paymentSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Ma'lumotlar noto'g'ri",
      fieldErrors: issue ? { [String(issue.path[0])]: issue.message } : undefined,
    };
  }

  const data = parsed.data;
  const previous = await prisma.storeSettings.findUnique({ where: { id: "store" }, select: { paymentQr: true } });
  await prisma.storeSettings.upsert({ where: { id: "store" }, create: { id: "store", ...data }, update: data });

  // Almashtirilgan QR rasmi endi kerak emas
  if (previous?.paymentQr && previous.paymentQr !== data.paymentQr) {
    const old = previous.paymentQr;
    after(() => deleteUploads([old]));
  }

  updateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Admin paneldan chekni tasdiqlash yoki rad etish (botdagi tugmalar bilan bir xil) */
export async function setPaymentResultAction(orderId: string, approve: boolean): Promise<ActionResult> {
  await requireAdmin();
  const order = await setPaymentResult(orderId, approve);
  if (order) after(() => sendPaymentResultNotification(order));
  revalidatePath("/admin", "layout");
  return { ok: true };
}
