import type { Metadata } from "next";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "To'lov" };

export default async function PaymentSettingsPage() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "store" },
    select: { cardNumber: true, cardHolder: true, paymentQr: true },
  });

  return (
    <>
      <PageHeader
        title="To'lov"
        description="Kartaga o'tkazma: mijoz buyurtma berayotganda karta raqami va QR kodni ko'radi"
      />
      <Card className="p-5">
        <PaymentSettingsForm
          settings={{
            cardNumber: settings?.cardNumber ?? null,
            cardHolder: settings?.cardHolder ?? null,
            paymentQr: settings?.paymentQr ?? null,
          }}
        />
      </Card>
    </>
  );
}
