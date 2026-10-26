import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = { title: "Buyurtma berish" };

export default function CheckoutPage() {
  return (
    <div className="pb-6 pt-6">
      <h1 className="mb-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Buyurtma berish</h1>
      <CheckoutForm />
    </div>
  );
}
