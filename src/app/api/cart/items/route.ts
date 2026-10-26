import { NextResponse } from "next/server";
import { handleApiError, readJson } from "@/lib/api";
import { readCartId, writeCartId } from "@/lib/cart-cookie";
import { addToCart, ensureCart } from "@/lib/services/cart";
import { addCartItemSchema } from "@/lib/validation";

/**
 * POST /api/cart/items — savatga qo'shish
 * body: { productId: string, quantity?: number }
 */
export async function POST(request: Request) {
  try {
    const { productId, quantity } = addCartItemSchema.parse(await readJson(request));
    const currentId = await readCartId();
    const cartId = await ensureCart(currentId);
    if (cartId !== currentId) await writeCartId(cartId);
    return NextResponse.json(await addToCart(cartId, productId, quantity));
  } catch (error) {
    return handleApiError(error);
  }
}
