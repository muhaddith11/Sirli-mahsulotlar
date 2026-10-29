import "server-only";
import type { OrderSource, OrderStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
import { fill, getDictionary, isLocale } from "@/i18n";
import {
  ORDER_SOURCE_LABELS,
  ORDER_STATUS_EMOJI,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_EMOJI,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { formatCardNumber, formatDate, formatPhone, formatPrice } from "@/lib/format";

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
  deliveryMethod?: "DELIVERY" | "PICKUP";
  deliveryZoneName?: string | null;
  deliveryFee?: number | null;
  itemsAmount?: number;
  promoCodeText?: string | null;
  promoDiscount?: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
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
  ];
  if (order.deliveryMethod === "PICKUP") {
    lines.push("🏪 <b>Olib ketadi:</b> do'kondan");
  } else {
    if (order.deliveryZoneName) lines.push(`🗺 <b>Viloyat:</b> ${e(order.deliveryZoneName)}`);
    lines.push(`📍 <b>Manzil:</b> ${e(order.deliveryAddress)}`);
  }

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
    `🧮 Mahsulotlar: ${totalQuantity} dona — ${formatPrice(order.itemsAmount || order.totalAmount)}`,
    ...(order.promoDiscount ? [`🎟 Promokod ${e(order.promoCodeText ?? "")}: −${formatPrice(order.promoDiscount)}`] : []),
    ...(order.deliveryMethod === "PICKUP"
      ? []
      : [`🚚 Yetkazish: ${order.deliveryFee == null ? "narxni operator aytadi" : order.deliveryFee === 0 ? "bepul" : formatPrice(order.deliveryFee)}`]),
    `💰 <b>To'lov: ${formatPrice(order.totalAmount)}</b>${order.deliveryFee == null && order.deliveryMethod !== "PICKUP" ? " + yetkazish" : ""}`,
    ...(order.paymentMethod ? [paymentLine(order.paymentMethod, order.paymentStatus ?? "UNPAID")] : []),
    "",
    `🕒 ${formatDate(order.createdAt)}`,
  );

  return lines.join("\n");
}

function paymentLine(method: PaymentMethod, status: PaymentStatus): string {
  if (method === "CASH") return "💵 Qabul qilganda to'laydi";
  return `💳 Kartaga o'tkazma — ${PAYMENT_STATUS_EMOJI[status]} ${PAYMENT_STATUS_LABELS[status]}`;
}

/** Botga kelgan chek ostidagi matn (do'kon egasiga); qaror qilingach yangi holat bilan qayta chiziladi */
export function receiptAdminCaption(
  order: Pick<OrderForMessage, "number" | "customerName" | "phone" | "totalAmount" | "deliveryMethod" | "deliveryFee"> & {
    paymentStatus: PaymentStatus;
  },
): string {
  const deliveryExtra = order.deliveryFee == null && order.deliveryMethod !== "PICKUP" ? " + yetkazish" : "";
  return [
    `🧾 <b>To'lov cheki — buyurtma #${order.number}</b>`,
    `👤 ${escapeHtml(order.customerName)} · 📞 ${formatPhone(order.phone)}`,
    `💰 Summa: <b>${formatPrice(order.totalAmount)}</b>${deliveryExtra}`,
    `${PAYMENT_STATUS_EMOJI[order.paymentStatus]} <b>${PAYMENT_STATUS_LABELS[order.paymentStatus]}</b>`,
  ].join("\n");
}

type CustomerOrder = Pick<OrderForMessage, "number" | "totalAmount" | "status"> & { locale: string };

/** Kartaga o'tkazma rekvizitlari (do'kon sozlamalaridan) */
export type PaymentDetails = { cardNumber: string | null; cardHolder: string | null };

type PayableOrder = Pick<OrderForMessage, "number" | "totalAmount" | "deliveryMethod" | "deliveryFee"> & { locale: string };

/** Mijozga: qaysi kartaga qancha o'tkazish va chekni shu chatga yuborish (mijoz tilida) */
export function paymentInstructionsMessage(order: PayableOrder, payment: PaymentDetails): string {
  const t = dictFor(order);
  const locale = isLocale(order.locale) ? order.locale : "uz";
  const deliveryExtra =
    order.deliveryMethod !== "PICKUP" && order.deliveryFee == null ? ` (${t.telegram.payDeliveryExtra})` : "";
  return [
    t.telegram.payTitle,
    ...(payment.cardNumber ? [`${t.telegram.payCard}: <code>${formatCardNumber(payment.cardNumber)}</code>`] : []),
    ...(payment.cardHolder ? [`${t.telegram.payHolder}: ${escapeHtml(payment.cardHolder)}`] : []),
    `${t.telegram.payAmount}: <b>${formatPrice(order.totalAmount, locale)}</b>${deliveryExtra}`,
    "",
    t.telegram.paySendReceipt,
  ].join("\n");
}

/** Mijozga: chek tasdiqlandi yoki rad etildi */
export function paymentResultMessage(order: { number: number; locale: string }, approved: boolean): string {
  const t = dictFor(order);
  return fill(approved ? t.telegram.paymentApproved : t.telegram.paymentRejected, { number: order.number });
}

function dictFor(order: { locale: string }) {
  return getDictionary(isLocale(order.locale) ? order.locale : "uz");
}

/**
 * Mijozga buyurtma qabul qilingani haqida xabar (mijoz tilida).
 * Kartaga o'tkazmada — rekvizitlar va "chekni shu chatga yuboring".
 */
export function orderReceivedMessage(
  order: CustomerOrder & Partial<PayableOrder> & { paymentMethod?: PaymentMethod },
  payment?: PaymentDetails | null,
): string {
  const t = dictFor(order);
  const locale = isLocale(order.locale) ? order.locale : "uz";
  const lines = [
    t.telegram.received,
    "",
    `${t.telegram.orderNumber}: <b>#${order.number}</b>`,
    `${t.telegram.sum}: <b>${formatPrice(order.totalAmount, locale)}</b>`,
    "",
  ];
  if (order.paymentMethod === "CARD" && payment) lines.push(paymentInstructionsMessage(order, payment), "");
  lines.push(t.telegram.thanks);
  return lines.join("\n");
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
