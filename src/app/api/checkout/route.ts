import { after, NextResponse } from "next/server";
import { handleApiError, jsonError, readJson } from "@/lib/api";
import { readCartId } from "@/lib/cart-cookie";
import { createOrder, sendNewOrderNotifications } from "@/lib/services/orders";
import { verifyTelegramInitData } from "@/lib/telegram/init-data";
import { checkoutSchema } from "@/lib/validation";

/**
 * POST /api/checkout — buyurtmani rasmiylashtirish
 * body: { name, phone, address, comment?, initData? }
 *
 * Buyurtma bazaga saqlangach, javob qaytariladi va shundan keyin (after)
 * do'kon egasining Telegram'iga batafsil xabar yuboriladi.
 */
export async function POST(request: Request) {
  try {
    const input = checkoutSchema.parse(await readJson(request));
    const cartId = await readCartId();
    if (!cartId) return jsonError("Savatingiz bo'sh", 400);

    // Mini App ichida bo'lsa — foydalanuvchini Telegram imzosi orqali aniqlaymiz
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramUser = input.initData && botToken ? verifyTelegramInitData(input.initData, botToken) : null;

    const order = await createOrder({
      cartId,
      name: input.name,
      phone: input.phone,
      address: input.address,
      comment: input.comment,
      telegramUser,
    });

    after(() => sendNewOrderNotifications(order));

    return NextResponse.json(
      { orderId: order.id, orderNumber: order.number, totalAmount: order.totalAmount },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
