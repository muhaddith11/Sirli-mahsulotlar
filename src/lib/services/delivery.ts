import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Yetkazish hududlari va do'kon sozlamalari keshi tegi */
export const SETTINGS_TAG = "settings";

export type DeliveryZoneData = {
  id: string;
  name: string;
  nameRu: string | null;
  price: number | null;
  freeFrom: number | null;
};

export const listDeliveryZones = unstable_cache(
  async (): Promise<DeliveryZoneData[]> =>
    prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, nameRu: true, price: true, freeFrom: true },
    }),
  ["delivery-zones"],
  { tags: [SETTINGS_TAG], revalidate: 600 },
);

export type StoreSettingsData = {
  phone: string | null;
  pickupAddress: string | null;
  pickupAddressRu: string | null;
  workingHours: string | null;
  workingHoursRu: string | null;
};

export const getStoreSettings = unstable_cache(
  async (): Promise<StoreSettingsData> => {
    const row = await prisma.storeSettings.findUnique({ where: { id: "store" } });
    return {
      phone: row?.phone ?? null,
      pickupAddress: row?.pickupAddress ?? null,
      pickupAddressRu: row?.pickupAddressRu ?? null,
      workingHours: row?.workingHours ?? null,
      workingHoursRu: row?.workingHoursRu ?? null,
    };
  },
  ["store-settings"],
  { tags: [SETTINGS_TAG], revalidate: 600 },
);

export { deliveryFeeFor } from "@/lib/delivery-fee";
