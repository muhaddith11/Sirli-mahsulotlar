import { revalidateTag } from "next/cache";
import { after, NextResponse } from "next/server";
import { getLocale } from "@/i18n/server";
import { handleApiError, jsonErrorCode, readJson } from "@/lib/api";
import { readCartId } from "@/lib/cart-cookie";
import { CATALOG_TAG } from "@/lib/services/products";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createOrder, sendNewOrderNotifications } from "@/lib/services/orders";
import { verifyTelegramInitData } from "@/lib/telegram/init-data";
import { checkoutSchema } from "@/lib/validation";

/**
 * POST /api/checkout — buyurtmani rasmiylashtirish
 * body: { name, phone, deliveryMethod, paymentMethod, zoneId?, address?, comment?, promoCode?, initData? }
 *
 * Buyurtma bazaga saqlangach, javob qaytariladi va shundan keyin (after)
 * do'kon egasining Telegram'iga batafsil xabar yuboriladi.
 */
export async function POST(request: Request) {
  try {
    // Bitta IP'dan 10 daqiqada ko'pi bilan 8 ta buyurtma (spam va xato tugma bosishlardan himoya)
    await enforceRateLimit("checkout", 8, 10 * 60);
    const input = checkoutSchema.parse(await readJson(request));
    const cartId = await readCartId();
    if (!cartId) return jsonErrorCode("cartEmpty", 400);

    // Mini App ichida bo'lsa — foydalanuvchini Telegram imzosi orqali aniqlaymiz
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramUser = input.initData && botToken ? verifyTelegramInitData(input.initData, botToken) : null;

    const order = await createOrder({
      cartId,
      name: input.name,
      phone: input.phone,
      address: input.address,
      comment: input.comment,
      deliveryMethod: input.deliveryMethod,
      paymentMethod: input.paymentMethod,
      zoneId: input.zoneId,
      promoCode: input.promoCode,
      locale: await getLocale(),
      telegramUser,
    });

    // Qoldiq o'zgardi — katalog keshi darhol yangilansin
    revalidateTag(CATALOG_TAG, { expire: 0 });
    after(() => sendNewOrderNotifications(order));

    return NextResponse.json(
      { orderId: order.id, orderNumber: order.number, totalAmount: order.totalAmount },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
