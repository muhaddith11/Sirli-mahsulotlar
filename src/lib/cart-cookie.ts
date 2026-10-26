import "server-only";
import { cookies } from "next/headers";
import { CART_COOKIE } from "./constants";

export async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/** Faqat Route Handler yoki Server Action ichida chaqirish mumkin */
export async function writeCartId(cartId: string) {
  const store = await cookies();
  const production = process.env.NODE_ENV === "production";
  store.set(CART_COOKIE, cartId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 kun
    // Telegram Web (web.telegram.org) Mini App'ni iframe ichida ochadi —
    // cookie u yerda ham ishlashi uchun productionda SameSite=None; Secure
    sameSite: production ? "none" : "lax",
    secure: production,
  });
}
