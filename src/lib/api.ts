import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError } from "./errors";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status });
}

/** Route Handler'lardagi xatolarni bir xil JSON ko'rinishga keltiradi */
export function handleApiError(error: unknown) {
  if (error instanceof AppError) return jsonError(error.message, error.status);
  if (error instanceof z.ZodError) {
    const { fieldErrors } = z.flattenError(error);
    return jsonError(error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri", 422, fieldErrors);
  }
  console.error(error);
  return jsonError("Serverda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.", 500);
}

/** JSON body'ni xavfsiz o'qiydi (bo'sh yoki noto'g'ri body → {}) */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
