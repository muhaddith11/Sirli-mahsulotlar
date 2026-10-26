import type { Metadata } from "next";
import { StoreSettingsForm, ZonesTable } from "@/components/admin/delivery-editor";
import { Card, PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Yetkazib berish" };

export default async function DeliveryPage() {
  const [zones, settings] = await Promise.all([
    prisma.deliveryZone.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { orders: true } } },
    }),
    prisma.storeSettings.findUnique({ where: { id: "store" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Yetkazib berish"
        description="Narx bo'sh qolsa, mijozga «narxni operator aytadi» deb ko'rsatiladi"
      />

      <section className="mb-8">
        <h2 className="mb-3 font-bold">Hududlar va narxlar</h2>
        <ZonesTable
          zones={zones.map((zone) => ({
            id: zone.id,
            name: zone.name,
            nameRu: zone.nameRu,
            price: zone.price,
            freeFrom: zone.freeFrom,
            isActive: zone.isActive,
            orderCount: zone._count.orders,
          }))}
        />
        <p className="mt-2 text-xs text-ink-3">
          Oxirgi qatorga yangi hudud yozib, «+» tugmasini bosing. «Bepul, so&apos;mdan» — shu summadan katta buyurtmaga
          yetkazib berish bepul.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-bold">Do&apos;kon ma&apos;lumotlari</h2>
        <Card className="p-5">
          <StoreSettingsForm
            settings={{
              phone: settings?.phone ?? null,
              pickupAddress: settings?.pickupAddress ?? null,
              pickupAddressRu: settings?.pickupAddressRu ?? null,
              workingHours: settings?.workingHours ?? null,
              workingHoursRu: settings?.workingHoursRu ?? null,
            }}
          />
        </Card>
      </section>
    </>
  );
}
