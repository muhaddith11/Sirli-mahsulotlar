import { NextResponse } from "next/server";
import { handleApiError, jsonError, readJson } from "@/lib/api";
import { readCartId } from "@/lib/cart-cookie";
import { removeCartItem, setCartItemQuantity } from "@/lib/services/cart";
import { updateCartItemSchema } from "@/lib/validation";

type Context = RouteContext<"/api/cart/items/[productId]">;

/**
 * PATCH /api/cart/items/:productId — miqdorni o'zgartirish
 * body: { quantity: number }  (0 — o'chirish)
 */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const { productId } = await params;
    const { quantity } = updateCartItemSchema.parse(await readJson(request));
    const cartId = await readCartId();
    if (!cartId) return jsonError("Savat topilmadi", 404);
    return NextResponse.json(await setCartItemQuantity(cartId, productId, quantity));
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/cart/items/:productId — savatdan o'chirish */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { productId } = await params;
    const cartId = await readCartId();
    if (!cartId) return jsonError("Savat topilmadi", 404);
    return NextResponse.json(await removeCartItem(cartId, productId));
  } catch (error) {
    return handleApiError(error);
  }
}
