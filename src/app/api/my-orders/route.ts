import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, readJson } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { verifyTelegramInitData } from "@/lib/telegram/init-data";

const bodySchema = z.object({
  initData: z.string().max(4096).optional(),
  // Saytda: shu qurilmada saqlangan buyurtma ID'lari (cuid — taxmin qilib bo'lmaydi)
  ids: z.array(z.string().regex(/^[a-z0-9]{20,32}$/)).max(30).optional(),
});

/**
 * POST /api/my-orders — mijozning buyurtmalari.
 * Telegram ichida: initData imzosi orqali foydalanuvchi aniqlanadi.
 * Saytda: brauzer eslab qolgan buyurtma ID'lari bo'yicha.
 */
export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await readJson(request));
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramUser = body.initData && botToken ? verifyTelegramInitData(body.initData, botToken) : null;

    const where = telegramUser
      ? { user: { telegramId: BigInt(telegramUser.id) } }
      : body.ids?.length
        ? { id: { in: body.ids } }
        : null;
    if (!where) return NextResponse.json({ orders: [], source: "none" });

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        number: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        items: { select: { image: true, quantity: true }, take: 4 },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({
      source: telegramUser ? "telegram" : "device",
      orders: orders.map((order) => ({
        id: order.id,
        number: order.number,
        status: order.status,
        totalAmount: order.totalAmount,
        date: formatDate(order.createdAt),
        images: order.items.map((item) => item.image).filter(Boolean),
        itemCount: order._count.items,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
