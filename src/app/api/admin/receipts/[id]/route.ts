import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RECEIPT_TYPES } from "@/lib/services/payments";
import { getTelegram } from "@/lib/telegram/bot";

/**
 * GET /api/admin/receipts/<orderId> — mijoz botga yuborgan to'lov cheki (faqat admin uchun).
 * Fayl Telegram'dan server orqali olinadi: bot tokeni brauzerga chiqmaydi.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/admin/receipts/[id]">) {
  if (!(await isAdmin())) return new NextResponse(null, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { receiptFileId: true, receiptMime: true } });
  const telegram = getTelegram();
  if (!order?.receiptFileId || !telegram) return new NextResponse(null, { status: 404 });

  const link = await telegram.getFileLink(order.receiptFileId).catch(() => null);
  const file = link ? await fetch(link).catch(() => null) : null;
  if (!file?.ok || !file.body) return new NextResponse(null, { status: 502 });

  // Faqat ruxsat etilgan turlar sahifada ochiladi; qolgani — yuklab olish
  const type = order.receiptMime && RECEIPT_TYPES.has(order.receiptMime) ? order.receiptMime : null;
  return new NextResponse(file.body, {
    headers: {
      "Content-Type": type ?? "application/octet-stream",
      "Content-Disposition": type ? "inline" : "attachment",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
