import { fill, type Dictionary } from "@/i18n";

export type ErrorCode = keyof Dictionary["errors"];

/** Foydalanuvchiga ko'rsatsa bo'ladigan xatolik: matn o'rniga lug'atdagi kod (HTTP status bilan) */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status = 400,
    public readonly params: Record<string, string | number> = {},
  ) {
    super(code);
    this.name = "AppError";
  }
}

export function errorText(error: AppError, t: Dictionary): string {
  return fill(t.errors[error.code], error.params);
}

/** Zod xabari lug'atdagi kod bo'lsa — tarjimasi, aks holda umumiy xabar */
export function issueText(message: string | undefined, t: Dictionary): string {
  return message && message in t.errors ? t.errors[message as ErrorCode] : t.errors.invalid;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
