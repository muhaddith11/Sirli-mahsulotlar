import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { readCartId } from "@/lib/cart-cookie";
import { clearCart, getCart } from "@/lib/services/cart";
import { EMPTY_CART } from "@/lib/cart-types";

/** GET /api/cart — joriy savat (cookie bo'yicha) */
export async function GET() {
  try {
    return NextResponse.json(await getCart(await readCartId()));
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/cart — savatni tozalash */
export async function DELETE() {
  try {
    const cartId = await readCartId();
    return NextResponse.json(cartId ? await clearCart(cartId) : EMPTY_CART);
  } catch (error) {
    return handleApiError(error);
  }
}
