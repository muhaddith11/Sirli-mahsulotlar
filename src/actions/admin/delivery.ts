"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { normalizePhone } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { SETTINGS_TAG } from "@/lib/services/delivery";
import type { ActionResult } from "./types";

function revalidate() {
  updateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");
}

const text = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().trim().max(max).nullable());
const money = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.coerce.number().int("Butun son kiriting").min(0, "Manfiy bo'lishi mumkin emas").max(100_000_000).nullable(),
);

const settingsSchema = z.object({
  phone: text(30),
  pickupAddress: text(300),
  pickupAddressRu: text(300),
  workingHours: text(100),
  workingHoursRu: text(100),
});

export async function saveStoreSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const data = { ...parsed.data };
  if (data.phone) {
    const phone = normalizePhone(data.phone);
    if (!phone) return { ok: false, error: "Telefon raqam noto'g'ri", fieldErrors: { phone: "Masalan: +998 90 123 45 67" } };
    data.phone = phone;
  }

  await prisma.storeSettings.upsert({ where: { id: "store" }, create: { id: "store", ...data }, update: data });
  revalidate();
  return { ok: true };
}

const zoneSchema = z.object({
  id: z.preprocess((v) => (v === "" ? undefined : v), z.string().optional()),
  name: z.string().trim().min(2, "Nomini kiriting").max(80),
  nameRu: text(80),
  price: money,
  freeFrom: money,
  isActive: z.boolean(),
});

export async function saveZoneAction(input: {
  id?: string;
  name: string;
  nameRu: string;
  price: string;
  freeFrom: string;
  isActive: boolean;
}): Promise<ActionResult> {
  await requireAdmin();
  const parsed = zoneSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.deliveryZone.update({ where: { id }, data });
  } else {
    const last = await prisma.deliveryZone.aggregate({ _max: { sortOrder: true } });
    await prisma.deliveryZone.create({ data: { ...data, sortOrder: (last._max.sortOrder ?? 0) + 1 } });
  }
  revalidate();
  return { ok: true };
}

export async function deleteZoneAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  // Buyurtmalarda hudud nomi saqlanib qoladi (deliveryZoneName)
  await prisma.deliveryZone.delete({ where: { id } });
  revalidate();
  return { ok: true };
}
