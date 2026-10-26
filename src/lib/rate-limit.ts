import "server-only";
import { headers } from "next/headers";
import { AppError } from "./errors";
import { prisma } from "./prisma";

/** So'rov yuborgan IP manzil (Vercel `x-forwarded-for` beradi) */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Oddiy "qat'iy oyna" chegarasi bazada saqlanadi — serverless'da xotira umumiy emas.
 * Chegaradan oshsa AppError("tooManyRequests", 429) tashlaydi.
 */
export async function enforceRateLimit(scope: string, limit: number, windowSeconds: number) {
  const key = `${scope}:${await clientIp()}`;
  const now = new Date();
  const row = await prisma.rateLimit.findUnique({ where: { key } });

  if (!row || row.resetAt <= now) {
    const resetAt = new Date(now.getTime() + windowSeconds * 1000);
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return;
  }

  if (row.count >= limit) throw new AppError("tooManyRequests", 429);
  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
}
