import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DAY = 24 * 60 * 60 * 1000;

function isAuthorized(request: Request): boolean {
  // Vercel Cron CRON_SECRET o'rnatilgan bo'lsa "Authorization: Bearer <secret>" yuboradi
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * GET /api/cron/cleanup — kunlik tozalash (vercel.json → crons):
 *   • 2 kundan eski bo'sh savatlar
 *   • 60 kundan beri tegilmagan savatlar (ichidagilari bilan)
 *   • muddati o'tgan so'rov chegarasi yozuvlari
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ ok: false }, { status: 401 });

  const now = Date.now();
  const [emptyCarts, staleCarts, rateLimits] = await Promise.all([
    prisma.cart.deleteMany({ where: { items: { none: {} }, updatedAt: { lt: new Date(now - 2 * DAY) } } }),
    prisma.cart.deleteMany({ where: { updatedAt: { lt: new Date(now - 60 * DAY) } } }),
    prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(now) } } }),
  ]);

  return NextResponse.json({
    ok: true,
    deleted: { emptyCarts: emptyCarts.count, staleCarts: staleCarts.count, rateLimits: rateLimits.count },
  });
}
