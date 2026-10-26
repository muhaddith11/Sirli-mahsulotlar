import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, jsonErrorCode, readJson } from "@/lib/api";
import { readCartId } from "@/lib/cart-cookie";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getCart } from "@/lib/services/cart";
import { findApplicablePromo } from "@/lib/services/promo";
import { promoCodeSchema } from "@/lib/validation";

/**
 * POST /api/promo — promokodni joriy savat uchun tekshiradi (oldindan ko'rish).
 * body: { code }  →  { code, discount }
 * Yakuniy hisob baribir buyurtma yaratilganda serverda qayta qilinadi.
 */
export async function POST(request: Request) {
  try {
    await enforceRateLimit("promo", 30, 10 * 60);
    const { code } = z.object({ code: promoCodeSchema }).parse(await readJson(request));
    const cart = await getCart(await readCartId());
    if (cart.items.length === 0) return jsonErrorCode("cartEmpty", 400);

    const { promo, discount } = await findApplicablePromo(code, cart.total);
    return NextResponse.json({ code: promo.code, discount });
  } catch (error) {
    return handleApiError(error);
  }
}
