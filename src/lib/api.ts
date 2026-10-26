import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getI18n } from "@/i18n/server";
import { AppError, errorText, issueText, type ErrorCode } from "./errors";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status });
}

/** Route Handler'lardagi xatolarni foydalanuvchi tilidagi bir xil JSON ko'rinishga keltiradi */
export async function handleApiError(error: unknown) {
  const { t } = await getI18n();
  if (error instanceof AppError) return jsonError(errorText(error, t), error.status);
  if (error instanceof z.ZodError) {
    const details: Record<string, string> = {};
    for (const issue of error.issues) {
      const field = String(issue.path[0] ?? "");
      if (field && !details[field]) details[field] = issueText(issue.message, t);
    }
    return jsonError(issueText(error.issues[0]?.message, t), 422, details);
  }
  console.error(error);
  return jsonError(t.errors.generic, 500);
}

/** Lug'atdagi kod bo'yicha xatolik javobi */
export async function jsonErrorCode(code: ErrorCode, status = 400) {
  return handleApiError(new AppError(code, status));
}

/** JSON body'ni xavfsiz o'qiydi (bo'sh yoki noto'g'ri body → {}) */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
