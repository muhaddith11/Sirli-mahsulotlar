import "server-only";
import type { OrderStatus } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { effectivePrice } from "@/lib/format";
import { notifyAdmins, sendHtmlMessage } from "@/lib/telegram/bot";
import type { TelegramWebAppUser } from "@/lib/telegram/init-data";
import { newOrderMessage, orderReceivedMessage, orderStatusMessage } from "@/lib/telegram/messages";
import { orderAdminKeyboard } from "@/lib/telegram/order-keyboard";
import { deliveryFeeFor } from "./delivery";
import { findApplicablePromo } from "./promo";

type CreateOrderInput = {
  cartId: string;
  name: string;
  phone: string;
  address: string;
  comment?: string;
  deliveryMethod: "DELIVERY" | "PICKUP";
  zoneId?: string;
  promoCode?: string;
  locale: Locale;
  telegramUser?: TelegramWebAppUser | null;
};

const orderWithDetails = {
  items: true,
  user: { select: { username: true, telegramId: true } },
} as const;

/**
 * Savatdagi mahsulotlardan buyurtma yaratadi. Hammasi bitta tranzaksiyada:
 * qoldiq tekshiriladi va kamaytiriladi, promokod va yetkazish narxi hisoblanadi,
 * buyurtma saqlanadi, savat tozalanadi.
 */
export async function createOrder(input: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { id: input.cartId },
      include: { items: { include: { product: true }, orderBy: { createdAt: "asc" } } },
    });
    if (!cart || cart.items.length === 0) throw new AppError("cartEmpty", 400);

    for (const { product, quantity } of cart.items) {
      if (!product.isActive) throw new AppError("productInactive", 409, { name: product.name });
      // Shartli kamaytirish: parallel buyurtmalarda qoldiq manfiyga tushmaydi
      const { count } = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (count === 0) {
        throw new AppError("stockShort", 409, { name: product.name, count: product.stock });
      }
    }

    let userId: string | undefined;
    if (input.telegramUser) {
      const tgUser = input.telegramUser;
      const profile = {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
        languageCode: tgUser.language_code ?? null,
        phone: input.phone,
        // Olib ketishda manzil bo'sh — avvalgi manzil saqlanib qoladi
        address: input.address || undefined,
      };
      const user = await tx.user.upsert({
        where: { telegramId: BigInt(tgUser.id) },
        create: { telegramId: BigInt(tgUser.id), ...profile },
        update: profile,
      });
      userId = user.id;
      if (!cart.userId) {
        // Savatni foydalanuvchiga bog'laymiz (agar unda boshqa savat bo'lmasa)
        const userCart = await tx.cart.findUnique({ where: { userId: user.id }, select: { id: true } });
        if (!userCart) await tx.cart.update({ where: { id: cart.id }, data: { userId: user.id } });
      }
    }

    const items = cart.items.map(({ product, quantity }) => {
      const unitPrice = effectivePrice(product);
      return {
        productId: product.id,
        productName: product.name,
        image: product.images[0] ?? null,
        unitPrice,
        quantity,
        totalPrice: unitPrice * quantity,
      };
    });

    const itemsAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Promokod: shu tranzaksiyada tekshiriladi; ishlatishlar soni optimistik tarzda oshiriladi
    let promo: Awaited<ReturnType<typeof findApplicablePromo>> | null = null;
    if (input.promoCode) {
      promo = await findApplicablePromo(input.promoCode, itemsAmount, tx);
      const { count } = await tx.promoCode.updateMany({
        where: { id: promo.promo.id, usedCount: promo.promo.usedCount },
        data: { usedCount: { increment: 1 } },
      });
      if (count === 0) throw new AppError("promoUsedUp", 409);
    }
    const promoDiscount = promo?.discount ?? 0;

    // Yetkazib berish: hudud narxi kiritilmagan bo'lsa — null (operator aytadi)
    const delivery = input.deliveryMethod === "DELIVERY";
    const zone = delivery && input.zoneId
      ? await tx.deliveryZone.findFirst({ where: { id: input.zoneId, isActive: true } })
      : null;
    // Viloyat faqat hududlar kiritilgan bo'lsa majburiy
    if (delivery && !zone && (input.zoneId || (await tx.deliveryZone.count({ where: { isActive: true } })) > 0)) {
      throw new AppError("zoneRequired", 400);
    }
    const deliveryFee = delivery ? deliveryFeeFor(zone, itemsAmount - promoDiscount) : 0;

    const order = await tx.order.create({
      data: {
        source: input.telegramUser ? "TELEGRAM" : "WEB",
        locale: input.locale,
        userId,
        customerName: input.name,
        phone: input.phone,
        deliveryMethod: input.deliveryMethod,
        deliveryZoneId: zone?.id,
        deliveryZoneName: zone?.name ?? null,
        deliveryAddress: delivery ? input.address : "",
        deliveryFee,
        comment: input.comment || null,
        itemsAmount,
        promoCodeId: promo?.promo.id,
        promoCodeText: promo?.promo.code ?? null,
        promoDiscount,
        totalAmount: itemsAmount - promoDiscount + (deliveryFee ?? 0),
        items: { create: items },
      },
      include: orderWithDetails,
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  });
}

type OrderWithDetails = Awaited<ReturnType<typeof createOrder>>;

/** Telegram xabarini qayta chizish uchun buyurtma (tarkibi va mijoz bilan) */
export function getOrderWithDetails(orderId: string) {
  return prisma.order.findUnique({ where: { id: orderId }, include: orderWithDetails });
}

/** Faol (yakunlanmagan) buyurtmalar — /yangi buyrug'i uchun */
export function listActiveOrders(take = 5) {
  return prisma.order.findMany({
    where: { status: { in: ["NEW", "PREPARING", "DELIVERING"] } },
    orderBy: { createdAt: "desc" },
    take,
    include: orderWithDetails,
  });
}

/** Do'kon egasiga va (Telegram orqali bo'lsa) mijozga xabar yuboradi */
export async function sendNewOrderNotifications(order: OrderWithDetails) {
  await notifyAdmins(newOrderMessage(order), { keyboard: orderAdminKeyboard(order.id, order.status, order.deliveryMethod) });

  if (order.user?.telegramId) {
    await sendHtmlMessage(order.user.telegramId.toString(), orderReceivedMessage(order)).catch((error) =>
      console.error("[telegram] mijozga xabar yuborilmadi:", error),
    );
  }
}

/**
 * Buyurtma holatini o'zgartiradi. Bekor qilinganda mahsulotlar omborga qaytariladi;
 * bekor qilingan buyurtmani qayta tiklab bo'lmaydi.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!current) throw new AppError("orderNotFound", 404);
    if (current.status === status) return null;
    if (current.status === "CANCELLED") {
      throw new AppError("orderCancelledLocked", 409);
    }

    if (status === "CANCELLED") {
      for (const item of current.items) {
        if (!item.productId) continue;
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status },
      include: { user: { select: { telegramId: true } } },
    });
  });
}

type UpdatedOrder = NonNullable<Awaited<ReturnType<typeof updateOrderStatus>>>;

/** Telegram orqali buyurtma bergan mijozga yangi holat haqida xabar */
export async function sendOrderStatusNotification(order: UpdatedOrder) {
  if (!order.user?.telegramId) return;
  await sendHtmlMessage(order.user.telegramId.toString(), orderStatusMessage(order)).catch((error) =>
    console.error("[telegram] status xabari yuborilmadi:", error),
  );
}
