"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EMPTY_CART, type CartData } from "@/lib/cart-types";
import { haptic, useTelegram } from "./telegram-provider";

type CartContextValue = {
  cart: CartData;
  loaded: boolean;
  isPending: (productId: string) => boolean;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

async function cartRequest(url: string, init?: RequestInit): Promise<CartData> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "Xatolik yuz berdi");
  return data as CartData;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { webApp } = useTelegram();
  const [cart, setCart] = useState<CartData>(EMPTY_CART);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      setCart(await cartRequest("/api/cart"));
    } catch {
      // Savat yuklanmasa ham sahifa ishlashda davom etadi
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const mutate = useCallback(
    async (productId: string, request: () => Promise<CartData>, onSuccess?: () => void) => {
      setPending((prev) => new Set(prev).add(productId));
      try {
        setCart(await request());
        onSuccess?.();
        return true;
      } catch (error) {
        haptic(webApp, "error");
        toast.error(error instanceof Error ? error.message : "Xatolik yuz berdi");
        return false;
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
    },
    [webApp],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loaded,
      refresh,
      isPending: (productId) => pending.has(productId),
      addItem: (productId, quantity = 1) =>
        mutate(
          productId,
          () => cartRequest("/api/cart/items", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
          () => {
            haptic(webApp, "light");
            toast.success("Savatga qo'shildi", {
              action: { label: "Savatga o'tish", onClick: () => router.push("/cart") },
            });
          },
        ),
      updateQuantity: (productId, quantity) =>
        mutate(productId, () =>
          cartRequest(`/api/cart/items/${productId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }),
        ),
      removeItem: (productId) =>
        mutate(productId, () => cartRequest(`/api/cart/items/${productId}`, { method: "DELETE" })),
    }),
    [cart, loaded, pending, mutate, refresh, router, webApp],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart CartProvider ichida ishlatilishi kerak");
  return context;
}
