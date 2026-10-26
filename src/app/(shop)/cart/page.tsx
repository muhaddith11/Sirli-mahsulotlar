import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.cart };
}

export default async function CartPage() {
  const { t } = await getI18n();
  return (
    <div className="pb-28 pt-4 md:pt-6 lg:pb-6">
      <h1 className="mb-4 text-2xl font-bold tracking-[-0.02em] md:text-3xl">{t.cart.title}</h1>
      <CartView />
    </div>
  );
}
