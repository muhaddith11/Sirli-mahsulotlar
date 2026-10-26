import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = { title: "Savat" };

export default function CartPage() {
  return (
    <div className="pb-6 pt-6">
      <h1 className="mb-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Savat</h1>
      <CartView />
    </div>
  );
}
