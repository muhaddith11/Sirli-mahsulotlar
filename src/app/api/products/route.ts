import { NextResponse, type NextRequest } from "next/server";
import { handleApiError } from "@/lib/api";
import { listProducts } from "@/lib/services/products";
import { productQuerySchema } from "@/lib/validation";

/**
 * GET /api/products
 *   ?q=kastryulka          — nomi, tavsifi, artikul yoki kategoriya bo'yicha qidiruv
 *   &category=choynaklar   — kategoriya slug'i
 *   &minPrice=100000&maxPrice=500000
 *   &sort=popular|new|price_asc|price_desc
 *   &featured=1&discounted=1
 *   &page=1&limit=12
 */
export async function GET(request: NextRequest) {
  try {
    const query = productQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json(await listProducts(query));
  } catch (error) {
    return handleApiError(error);
  }
}
