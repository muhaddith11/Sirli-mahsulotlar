import { NextResponse } from "next/server";
import { handleApiError, jsonError } from "@/lib/api";
import { getProductBySlug } from "@/lib/services/products";

/** GET /api/products/:slug — bitta mahsulot */
export async function GET(_request: Request, { params }: RouteContext<"/api/products/[slug]">) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return jsonError("Mahsulot topilmadi", 404);
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}
