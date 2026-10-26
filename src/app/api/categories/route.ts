import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { listCategories } from "@/lib/services/products";

/** GET /api/categories — kategoriyalar va ulardagi mahsulotlar soni */
export async function GET() {
  try {
    return NextResponse.json(await listCategories());
  } catch (error) {
    return handleApiError(error);
  }
}
