import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.checkout };
}

export default async function CheckoutPage() {
  const { t } = await getI18n();
  return (
    <div className="pb-28 pt-4 md:pt-6 lg:pb-6">
      <h1 className="mb-4 text-2xl font-bold tracking-[-0.02em] md:text-3xl">{t.checkout.title}</h1>
      <CheckoutForm />
    </div>
  );
}
