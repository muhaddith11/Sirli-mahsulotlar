import "server-only";
import { prisma } from "@/lib/prisma";
import { getAdminChatIds, getPublicAppUrl, getTelegram, sendHtmlMessage } from "@/lib/telegram/bot";
import { paymentResultMessage, receiptAdminCaption } from "@/lib/telegram/messages";
import { paymentReviewKeyboard } from "@/lib/telegram/order-keyboard";
import { getStoreSettings, type PaymentSettings } from "./delivery";

/**
 * Chek sifatida qabul qilinadigan fayl turlari. SVG/HTML yo'q: chek admin panelda
 * sayt domenidan ochiladi, ichida skript bo'lishi mumkin bo'lgan turlar xavfli.
 */
export const RECEIPT_TYPES: ReadonlySet<string> = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

/** Kartaga o'tkazma rekvizitlari; karta ham, QR ham kiritilmagan bo'lsa — null (variant o'chiq) */
export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  return (await getStoreSettings()).payment;
}

const paymentOrderSelect = {
  id: true,
  number: true,
  locale: true,
  customerName: true,
  phone: true,
  totalAmount: true,
  deliveryMethod: true,
  deliveryFee: true,
  paymentMethod: true,
  paymentStatus: true,
  user: { select: { telegramId: true } },
} as const;

/** Mijozning chek kutilayotgan eng so'nggi buyurtmasi: kartaga o'tkazma, tasdiqlanmagan, yakunlanmagan */
export function findAwaitingPaymentOrder(telegramId: number) {
  return prisma.order.findFirst({
    where: {
      user: { telegramId: BigInt(telegramId) },
      paymentMethod: "CARD",
      paymentStatus: { in: ["UNPAID", "REVIEW", "REJECTED"] },
      status: { in: ["NEW", "PREPARING", "DELIVERING"] },
    },
    orderBy: { createdAt: "desc" },
    select: paymentOrderSelect,
  });
}

/** Chekni buyurtmaga yozadi (qayta yuborilsa — oxirgisi saqlanadi) va tekshiruvga qo'yadi */
export function attachReceipt(orderId: string, fileId: string, mime: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "REVIEW", receiptFileId: fileId, receiptMime: mime, receiptAt: new Date() },
    select: paymentOrderSelect,
  });
}

export type PaymentOrder = Awaited<ReturnType<typeof attachReceipt>>;

/**
 * Chekni tasdiqlash yoki rad etish. Holat allaqachon shunday bo'lsa (masalan, ikki admin bir vaqtda bosgan) — null.
 * Shartli yangilash: parallel bosishlarda mijozga ikki marta xabar bormaydi.
 */
export async function setPaymentResult(orderId: string, approve: boolean): Promise<PaymentOrder | null> {
  const next = approve ? "PAID" : "REJECTED";
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, paymentMethod: "CARD", paymentStatus: { not: next } },
    data: { paymentStatus: next, paidAt: approve ? new Date() : null },
  });
  if (count === 0) return null;
  return prisma.order.findUnique({ where: { id: orderId }, select: paymentOrderSelect });
}

/** Mijozga: to'lov tasdiqlandi yoki chek rad etildi */
export async function sendPaymentResultNotification(order: PaymentOrder) {
  if (!order.user?.telegramId) return;
  const approved = order.paymentStatus === "PAID";
  await sendHtmlMessage(order.user.telegramId.toString(), paymentResultMessage(order, approved)).catch((error) =>
    console.error("[telegram] to'lov natijasi yuborilmadi:", error),
  );
}

/** Mijoz chekini do'kon egasi(lari)ga "Tasdiqlash / Rad etish" tugmalari bilan yuboradi */
export async function forwardReceiptToAdmins(order: PaymentOrder, receipt: { fileId: string; photo: boolean }) {
  const telegram = getTelegram();
  const chatIds = getAdminChatIds();
  if (!telegram || chatIds.length === 0) return;
  const extra = {
    caption: receiptAdminCaption(order),
    parse_mode: "HTML" as const,
    reply_markup: paymentReviewKeyboard(order.id, true),
  };
  const results = await Promise.allSettled(
    chatIds.map((chatId) =>
      receipt.photo ? telegram.sendPhoto(chatId, receipt.fileId, extra) : telegram.sendDocument(chatId, receipt.fileId, extra),
    ),
  );
  results.forEach((result, i) => {
    if (result.status === "rejected") console.error(`[telegram] ${chatIds[i]} ga chek yuborilmadi:`, result.reason);
  });
}

/** Telegram rasmni faqat ochiq https manzildan ola oladi (lokal /api/uploads/... → APP_URL bilan) */
function publicImageUrl(url: string): string | null {
  if (url.startsWith("https://")) return url;
  const appUrl = getPublicAppUrl();
  return appUrl && url.startsWith("/") ? `${appUrl}${url}` : null;
}

/** Telegram rasm izohi 1024 belgigacha */
const CAPTION_LIMIT = 1024;

/** To'lov rekvizitlari xabarini QR rasm bilan yuboradi; QR bo'lmasa yoki yuborilmasa — oddiy matn */
export async function sendPaymentMessage(chatId: number | string, html: string, payment: PaymentSettings) {
  const telegram = getTelegram();
  if (!telegram) return;
  const qr = payment.qr ? publicImageUrl(payment.qr) : null;
  if (qr) {
    try {
      if (html.length <= CAPTION_LIMIT) {
        await telegram.sendPhoto(chatId, qr, { caption: html, parse_mode: "HTML" });
        return;
      }
      await sendHtmlMessage(chatId, html);
      await telegram.sendPhoto(chatId, qr);
      return;
    } catch (error) {
      console.error("[telegram] QR rasm yuborilmadi, matn yuboriladi:", error);
    }
  }
  await sendHtmlMessage(chatId, html);
}

type TelegramFrom = { id: number; first_name: string; last_name?: string; username?: string; language_code?: string };

/**
 * Saytdan berilgan buyurtmani botdagi "pay_<id>" havolasi orqali Telegram akkauntga bog'laydi,
 * shunda mijoz chekni botga yubora oladi. Boshqa akkauntga bog'langan buyurtma — null.
 */
export async function linkOrderToTelegramUser(orderId: string, from: TelegramFrom): Promise<PaymentOrder | null> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: paymentOrderSelect });
  if (!order) return null;
  const telegramId = BigInt(from.id);
  if (order.user?.telegramId) return order.user.telegramId === telegramId ? order : null;

  const user = await prisma.user.upsert({
    where: { telegramId },
    create: {
      telegramId,
      firstName: from.first_name,
      lastName: from.last_name ?? null,
      username: from.username ?? null,
      languageCode: from.language_code ?? null,
    },
    update: {},
  });
  return prisma.order.update({ where: { id: orderId }, data: { userId: user.id }, select: paymentOrderSelect });
}
