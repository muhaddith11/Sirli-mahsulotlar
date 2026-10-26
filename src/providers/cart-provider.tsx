"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/provider";
import { EMPTY_CART, type CartData } from "@/lib/cart-types";
import { haptic, useTelegram } from "./telegram-provider";

type CartContextValue = {
  cart: CartData;
  loaded: boolean;
  isPending: (productId: string) => boolean;
  quantityOf: (productId: string) => number;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

async function cartRequest(url: string, fallbackError: string, init?: RequestInit): Promise<CartData> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? fallbackError);
  return data as CartData;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { webApp } = useTelegram();
  const { t } = useI18n();
  const [cart, setCart] = useState<CartData>(EMPTY_CART);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      setCart(await cartRequest("/api/cart", t.errors.generic));
    } catch {
      // Savat yuklanmasa ham sahifa ishlashda davom etadi
    } finally {
      setLoaded(true);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const mutate = useCallback(
    async (productId: string, request: () => Promise<CartData>, feedback: "light" | null = null) => {
      setPending((prev) => new Set(prev).add(productId));
      try {
        setCart(await request());
        if (feedback) haptic(webApp, feedback);
        return true;
      } catch (error) {
        haptic(webApp, "error");
        toast.error(error instanceof Error ? error.message : t.errors.generic);
        return false;
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
    },
    [webApp, t],
  );

  const value = useMemo<CartContextValue>(() => {
    const json = (body: unknown) => ({ body: JSON.stringify(body) });
    return {
      cart,
      loaded,
      refresh,
      isPending: (productId) => pending.has(productId),
      quantityOf: (productId) => cart.items.find((item) => item.productId === productId)?.quantity ?? 0,
      addItem: (productId, quantity = 1) =>
        mutate(
          productId,
          () => cartRequest("/api/cart/items", t.errors.generic, { method: "POST", ...json({ productId, quantity }) }),
          "light",
        ),
      updateQuantity: (productId, quantity) =>
        mutate(productId, () =>
          cartRequest(`/api/cart/items/${productId}`, t.errors.generic, { method: "PATCH", ...json({ quantity }) }),
        ),
      removeItem: (productId) =>
        mutate(productId, () => cartRequest(`/api/cart/items/${productId}`, t.errors.generic, { method: "DELETE" })),
    };
  }, [cart, loaded, pending, mutate, refresh, t]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart CartProvider ichida ishlatilishi kerak");
  return context;
}
