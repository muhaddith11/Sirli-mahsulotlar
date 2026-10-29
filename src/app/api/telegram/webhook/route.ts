import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { after, NextResponse } from "next/server";
import type { CallbackQuery, Message, Update } from "telegraf/types";
import { readJson } from "@/lib/api";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { AppError, errorText } from "@/lib/errors";
import { fill, getDictionary, isLocale } from "@/i18n";
import {
  getOrderWithDetails,
  listActiveOrders,
  sendOrderStatusNotification,
  updateOrderStatus,
} from "@/lib/services/orders";
import {
  attachReceipt,
  findAwaitingPaymentOrder,
  forwardReceiptToAdmins,
  getPaymentSettings,
  linkOrderToTelegramUser,
  RECEIPT_TYPES,
  sendPaymentMessage,
  sendPaymentResultNotification,
  setPaymentResult,
} from "@/lib/services/payments";
import { CATALOG_TAG } from "@/lib/services/products";
import {
  adminPanelButton,
  getPublicAppUrl,
  getTelegram,
  isAdminChat,
  sendHtmlMessage,
  setAdminCommands,
} from "@/lib/telegram/bot";
import { newOrderMessage, paymentInstructionsMessage, receiptAdminCaption } from "@/lib/telegram/messages";
import {
  cancelConfirmKeyboard,
  orderAdminKeyboard,
  parseOrderCallback,
  paymentReviewKeyboard,
} from "@/lib/telegram/order-keyboard";

function isAuthorized(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = request.headers.get("x-telegram-bot-api-secret-token");
  if (!expected || !received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/telegram/webhook
 *   /start  — do'konni va "Buyurtmalarim"ni ochish tugmalari
 *   /start pay_<orderId> — saytdan berilgan buyurtmani shu akkauntga bog'lab, to'lov rekvizitlarini yuboradi
 *   /id     — chat ID (TELEGRAM_ADMIN_CHAT_ID uchun)
 *   /admin  — (egasi uchun) admin panelni ochish tugmasi
 *   /yangi  — (egasi uchun) faol buyurtmalar, holat tugmalari bilan
 *   rasm/PDF — kartaga o'tkazma cheki: buyurtmaga yoziladi va egasiga "Tasdiqlash / Rad etish" bilan boradi
 *   tugmalar — buyurtma holatini va to'lovni Telegram'ning o'zida o'zgartirish
 * Webhook'ni `npm run bot:setup` o'rnatadi.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ ok: false }, { status: 401 });

  const update = (await readJson(request)) as Update;

  try {
    if ("callback_query" in update && update.callback_query) {
      await handleCallback(update.callback_query);
    } else if ("message" in update && update.message) {
      const message = update.message;
      if ("text" in message) await handleCommand(message as Message.TextMessage);
      else if ("photo" in message || "document" in message) {
        await handleReceipt(message as Message.PhotoMessage | Message.DocumentMessage);
      }
    }
  } catch (error) {
    console.error("[telegram] webhook xatosi:", error);
  }

  // Telegram qayta yubormasligi uchun har doim 200 qaytaramiz
  return NextResponse.json({ ok: true });
}

async function handleCommand(message: Message.TextMessage) {
  const chatId = message.chat.id;
  const text = message.text.trim();
  const ru = message.from?.language_code?.startsWith("ru");

  if (text.startsWith("/start")) {
    // Saytdagi "Chekni Telegram'da yuborish" tugmasi: /start pay_<orderId>
    const payload = text.split(/\s+/)[1] ?? "";
    if (payload.startsWith("pay_") && message.from && message.chat.type === "private") {
      await startPayment(chatId, payload.slice(4), message.from);
      return;
    }

    const appUrl = getPublicAppUrl();
    const admin = isAdminChat(chatId, message.from?.id);
    const greeting = ru
      ? "Здравствуйте! 🌸\n<b>Sirli Mahsulotlar</b> — эмалированные кастрюли, чайники и кухонная посуда.\n\nОткройте каталог кнопкой ниже и оформите заказ в пару нажатий."
      : "Assalomu alaykum! 🌸\n<b>Sirli Mahsulotlar</b> — emal kastryulkalar, choynaklar va oshxona idishlari.\n\nPastdagi tugma orqali katalogni oching va bir necha bosishda buyurtma bering.";
    const adminHint = admin ? "\n\n👤 Do'kon egasi: admin panel — /admin, faol buyurtmalar — /yangi" : "";
    await sendHtmlMessage(
      chatId,
      greeting + adminHint,
      appUrl
        ? {
            keyboard: {
              inline_keyboard: [
                [{ text: ru ? "🛍 Открыть магазин" : "🛍 Do'konni ochish", web_app: { url: appUrl } }],
                [{ text: ru ? "📦 Мои заказы" : "📦 Buyurtmalarim", web_app: { url: `${appUrl}/orders` } }],
                // Admin panel tugmasi faqat do'kon egasiga ko'rinadi
                ...(admin ? [[adminPanelButton(appUrl, message.chat.type)]] : []),
              ],
            },
          }
        : {},
    );
    if (admin) after(() => setAdminCommands(chatId).catch((error) => console.error("[telegram] admin buyruqlari:", error)));
    return;
  }

  if (text.startsWith("/admin") && isAdminChat(chatId, message.from?.id)) {
    const appUrl = getPublicAppUrl();
    if (!appUrl) {
      await sendHtmlMessage(chatId, "APP_URL https:// manzil bilan o'rnatilmagan — admin panel tugmasini yaratib bo'lmadi.");
      return;
    }
    await sendHtmlMessage(chatId, "⚙️ <b>Admin panel</b>\nMahsulotlar, buyurtmalar va omborni boshqarish.", {
      keyboard: { inline_keyboard: [[adminPanelButton(appUrl, message.chat.type)]] },
    });
    after(() => setAdminCommands(chatId).catch((error) => console.error("[telegram] admin buyruqlari:", error)));
    return;
  }

  if (text.startsWith("/id")) {
    await sendHtmlMessage(chatId, `Chat ID: <code>${chatId}</code>`);
    return;
  }

  if (text.startsWith("/yangi") && isAdminChat(chatId, message.from?.id)) {
    const orders = await listActiveOrders(5);
    if (orders.length === 0) {
      await sendHtmlMessage(chatId, "✅ Faol buyurtmalar yo'q.");
      return;
    }
    await sendHtmlMessage(chatId, `📋 Faol buyurtmalar: <b>${orders.length}</b> ta (oxirgilari)`);
    for (const order of orders.reverse()) {
      await sendHtmlMessage(chatId, newOrderMessage(order), { keyboard: orderAdminKeyboard(order.id, order.status, order.deliveryMethod) });
    }
  }
}

type TelegramFrom = NonNullable<Message.TextMessage["from"]>;

/** Mijoz tilidagi lug'at: buyurtma bo'lsa — buyurtma tili, aks holda Telegram tili */
function dictFor(locale: string | undefined) {
  return getDictionary(locale && isLocale(locale) ? locale : "uz");
}

/** Saytdan berilgan buyurtma: akkauntga bog'lanadi va karta rekvizitlari yuboriladi */
async function startPayment(chatId: number, orderId: string, from: TelegramFrom) {
  const fallback = dictFor(from.language_code?.startsWith("ru") ? "ru" : "uz");
  const order = await linkOrderToTelegramUser(orderId, from);
  if (!order) {
    await sendHtmlMessage(chatId, fallback.telegram.orderNotLinked);
    return;
  }
  const t = dictFor(order.locale);
  if (order.paymentStatus === "PAID") {
    await sendHtmlMessage(chatId, fill(t.telegram.alreadyPaid, { number: order.number }));
    return;
  }
  const payment = await getPaymentSettings();
  if (order.paymentMethod !== "CARD" || !payment) {
    await sendHtmlMessage(chatId, t.telegram.noPendingPayment);
    return;
  }
  await sendPaymentMessage(chatId, paymentInstructionsMessage(order, payment), payment);
}

/** Mijoz yuborgan to'lov cheki (rasm yoki PDF) */
async function handleReceipt(message: Message.PhotoMessage | Message.DocumentMessage) {
  const from = message.from;
  if (!from || message.chat.type !== "private") return;
  const chatId = message.chat.id;
  const fallback = dictFor(from.language_code?.startsWith("ru") ? "ru" : "uz");

  let receipt: { fileId: string; mime: string; photo: boolean };
  if ("photo" in message) {
    // Telegram bir nechta o'lchamni beradi — eng kattasi oxirida
    const largest = message.photo[message.photo.length - 1];
    if (!largest) return;
    receipt = { fileId: largest.file_id, mime: "image/jpeg", photo: true };
  } else {
    const mime = message.document.mime_type ?? "";
    if (!RECEIPT_TYPES.has(mime)) {
      await sendHtmlMessage(chatId, fallback.telegram.receiptUnsupported);
      return;
    }
    receipt = { fileId: message.document.file_id, mime, photo: false };
  }

  const order = await findAwaitingPaymentOrder(from.id);
  if (!order) {
    // Do'kon egasi botga boshqa maqsadda rasm yuborgan bo'lishi mumkin — unga javob bermaymiz
    if (!isAdminChat(chatId, from.id)) await sendHtmlMessage(chatId, fallback.telegram.noPendingPayment);
    return;
  }

  const updated = await attachReceipt(order.id, receipt.fileId, receipt.mime);
  revalidatePath("/admin", "layout");
  // Avval egasiga: mijozga javob yuborilmay qolsa ham chek yo'qolmasin
  await forwardReceiptToAdmins(updated, receipt);
  await sendHtmlMessage(chatId, fill(dictFor(order.locale).telegram.receiptReceived, { number: order.number })).catch(
    (error) => console.error("[telegram] chek javobi yuborilmadi:", error),
  );
}

async function handleCallback(query: CallbackQuery) {
  const telegram = getTelegram();
  if (!telegram) return;
  const answer = (text?: string, alert = false) => telegram.answerCbQuery(query.id, text, { show_alert: alert });

  const parsed = parseOrderCallback("data" in query ? query.data : undefined);
  const message = query.message;
  if (!parsed || !message) return answer();

  // Faqat do'kon egasi (yoki egasi qo'shgan guruh) holatni o'zgartira oladi
  if (!isAdminChat(query.from.id, message.chat.id)) return answer("Bu amal faqat do'kon egasi uchun", true);

  const edit = (html: string, keyboard: ReturnType<typeof orderAdminKeyboard>) =>
    telegram.editMessageText(message.chat.id, message.message_id, undefined, html, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      reply_markup: keyboard,
    });

  if (parsed.action === "payment") {
    const order = await setPaymentResult(parsed.orderId, parsed.approve);
    if (!order) return answer("Bu chek bo'yicha qaror allaqachon qabul qilingan");
    after(() => sendPaymentResultNotification(order));
    revalidatePath("/admin", "layout");
    await telegram
      .editMessageCaption(message.chat.id, message.message_id, undefined, receiptAdminCaption(order), {
        parse_mode: "HTML",
        reply_markup: paymentReviewKeyboard(order.id, false),
      })
      .catch((error: unknown) => {
        if (!String(error).includes("not modified")) throw error;
      });
    return answer(parsed.approve ? "✅ To'lov tasdiqlandi — mijozga xabar boradi" : "❌ Chek rad etildi — mijozga xabar boradi");
  }

  if (parsed.action === "askCancel") {
    await telegram.editMessageReplyMarkup(message.chat.id, message.message_id, undefined, cancelConfirmKeyboard(parsed.orderId));
    return answer("Buyurtma bekor qilinsinmi? Mahsulotlar omborga qaytadi.");
  }

  if (parsed.action === "back") {
    const order = await getOrderWithDetails(parsed.orderId);
    if (!order) return answer("Buyurtma topilmadi", true);
    await telegram.editMessageReplyMarkup(message.chat.id, message.message_id, undefined, orderAdminKeyboard(order.id, order.status, order.deliveryMethod));
    return answer();
  }

  try {
    const updated = await updateOrderStatus(parsed.orderId, parsed.status);
    if (updated) after(() => sendOrderStatusNotification(updated));
  } catch (error) {
    if (error instanceof AppError) return answer(errorText(error, getDictionary("uz")), true);
    throw error;
  }

  const order = await getOrderWithDetails(parsed.orderId);
  if (!order) return answer("Buyurtma topilmadi", true);
  revalidatePath("/admin", "layout");
  if (order.status === "CANCELLED") {
    // qoldiq qaytdi
    revalidateTag(CATALOG_TAG, { expire: 0 });
    revalidatePath("/", "layout");
  }

  await edit(newOrderMessage(order), orderAdminKeyboard(order.id, order.status, order.deliveryMethod)).catch((error: unknown) => {
    // "message is not modified" — xabar allaqachon shu holatda
    if (!String(error).includes("not modified")) throw error;
  });
  return answer(`Holat: ${ORDER_STATUS_LABELS[order.status]}`);
}
