import "server-only";
import type { OrderSource, OrderStatus } from "@/generated/prisma/enums";
import { ORDER_SOURCE_LABELS, ORDER_STATUS_EMOJI, ORDER_STATUS_LABELS, SHOP_NAME } from "@/lib/constants";
import { formatDate, formatPhone, formatPrice } from "@/lib/format";

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type OrderForMessage = {
  number: number;
  status: OrderStatus;
  source: OrderSource;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  comment: string | null;
  totalAmount: number;
  createdAt: Date;
  items: { productName: string; unitPrice: number; quantity: number; totalPrice: number }[];
  user?: { username: string | null; telegramId: bigint | null } | null;
};

/** Do'kon egasiga yuboriladigan "Yangi buyurtma" xabari (HTML) */
export function newOrderMessage(order: OrderForMessage): string {
  const e = escapeHtml;
  const lines: string[] = [
    `🛒 <b>Yangi buyurtma #${order.number}</b>`,
    "",
    `👤 <b>Mijoz:</b> ${e(order.customerName)}`,
    // Telegram HTML'da tel: havolalari qo'llab-quvvatlanmaydi; raqamni klient o'zi bosiladigan qiladi
    `📞 <b>Telefon:</b> ${formatPhone(order.phone)}`,
    `📍 <b>Manzil:</b> ${e(order.deliveryAddress)}`,
  ];

  if (order.comment) lines.push(`💬 <b>Izoh:</b> ${e(order.comment)}`);

  const telegramUser = order.user?.username
    ? ` (@${e(order.user.username)})`
    : order.user?.telegramId
      ? ` (<a href="tg://user?id=${order.user.telegramId}">profil</a>)`
      : "";
  lines.push(`📱 <b>Manba:</b> ${ORDER_SOURCE_LABELS[order.source]}${telegramUser}`);

  lines.push("", "📦 <b>Mahsulotlar:</b>");
  order.items.forEach((item, i) => {
    lines.push(
      `${i + 1}. ${e(item.productName)}`,
      `    ${item.quantity} × ${formatPrice(item.unitPrice)} = <b>${formatPrice(item.totalPrice)}</b>`,
    );
  });

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  lines.push(
    "",
    `🧮 Jami: ${totalQuantity} dona`,
    `💰 <b>Umumiy summa: ${formatPrice(order.totalAmount)}</b>`,
    "",
    `🕒 ${formatDate(order.createdAt)}`,
  );

  return lines.join("\n");
}

/** Mijozga buyurtma qabul qilingani haqida xabar */
export function orderReceivedMessage(order: Pick<OrderForMessage, "number" | "totalAmount">): string {
  return [
    `✅ <b>Buyurtmangiz qabul qilindi!</b>`,
    "",
    `Buyurtma raqami: <b>#${order.number}</b>`,
    `Summa: <b>${formatPrice(order.totalAmount)}</b>`,
    "",
    `Operatorimiz tez orada siz bilan bog'lanadi. ${SHOP_NAME} ni tanlaganingiz uchun rahmat! 🌸`,
  ].join("\n");
}

/** Mijozga buyurtma holati o'zgargani haqida xabar */
export function orderStatusMessage(order: Pick<OrderForMessage, "number" | "status">): string {
  const extra: Partial<Record<OrderStatus, string>> = {
    PREPARING: "Buyurtmangiz yig'ilmoqda.",
    DELIVERING: "Kuryer yo'lda — tez orada yetib boradi.",
    COMPLETED: "Xaridingiz uchun rahmat! Yana kutib qolamiz 🌸",
    CANCELLED: "Savollar bo'lsa, bizga yozing.",
  };
  return [
    `${ORDER_STATUS_EMOJI[order.status]} Buyurtma <b>#${order.number}</b> holati: <b>${ORDER_STATUS_LABELS[order.status]}</b>`,
    extra[order.status] ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}
