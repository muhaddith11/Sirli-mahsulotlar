import "server-only";
import type { OrderSource, OrderStatus } from "@/generated/prisma/enums";
import { fill, getDictionary, isLocale } from "@/i18n";
import { ORDER_SOURCE_LABELS, ORDER_STATUS_EMOJI, ORDER_STATUS_LABELS } from "@/lib/constants";
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
  locale?: string;
  items: { productName: string; unitPrice: number; quantity: number; totalPrice: number }[];
  user?: { username: string | null; telegramId: bigint | null } | null;
};

/**
 * Do'kon egasiga yuboriladigan buyurtma xabari (HTML).
 * Holat o'zgarganda xabar shu funksiya bilan qayta chiziladi.
 */
export function newOrderMessage(order: OrderForMessage): string {
  const e = escapeHtml;
  const lines: string[] = [
    `🛒 <b>Buyurtma #${order.number}</b>`,
    `${ORDER_STATUS_EMOJI[order.status]} <b>Holat:</b> ${ORDER_STATUS_LABELS[order.status]}`,
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
  if (order.locale === "ru") lines.push("🌐 <b>Mijoz tili:</b> ruscha");

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

type CustomerOrder = Pick<OrderForMessage, "number" | "totalAmount" | "status"> & { locale: string };

function dictFor(order: { locale: string }) {
  return getDictionary(isLocale(order.locale) ? order.locale : "uz");
}

/** Mijozga buyurtma qabul qilingani haqida xabar (mijoz tilida) */
export function orderReceivedMessage(order: CustomerOrder): string {
  const t = dictFor(order);
  const locale = isLocale(order.locale) ? order.locale : "uz";
  return [
    t.telegram.received,
    "",
    `${t.telegram.orderNumber}: <b>#${order.number}</b>`,
    `${t.telegram.sum}: <b>${formatPrice(order.totalAmount, locale)}</b>`,
    "",
    t.telegram.thanks,
  ].join("\n");
}

/** Mijozga buyurtma holati o'zgargani haqida xabar (mijoz tilida) */
export function orderStatusMessage(order: Pick<CustomerOrder, "number" | "status" | "locale">): string {
  const t = dictFor(order);
  const extra = (t.telegram.statusExtra as Partial<Record<OrderStatus, string>>)[order.status];
  return [
    `${ORDER_STATUS_EMOJI[order.status]} ${fill(t.telegram.statusLine, { number: order.number, status: t.status[order.status] })}`,
    extra ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}
