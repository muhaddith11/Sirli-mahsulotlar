import type { Metadata } from "next";
import { MyOrders } from "@/components/shop/my-orders";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.orders.title, robots: { index: false } };
}

export default async function OrdersPage() {
  const { t } = await getI18n();
  return (
    <div className="pb-6 pt-4 md:pt-6">
      <h1 className="mb-4 text-2xl font-bold tracking-[-0.02em] md:text-3xl">{t.orders.title}</h1>
      <MyOrders />
    </div>
  );
}
