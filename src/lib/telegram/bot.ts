import "server-only";
import { Telegram } from "telegraf";
import type { InlineKeyboardMarkup } from "telegraf/types";

let client: Telegram | null = null;

/** Bot tokeni bo'lmasa null qaytaradi — bildirishnomalar shunchaki o'tkazib yuboriladi */
export function getTelegram(): Telegram | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  client ??= new Telegram(token);
  return client;
}

export function getAdminChatIds(): string[] {
  return (process.env.TELEGRAM_ADMIN_CHAT_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/** Xabar yuborgan yoki tugmani bosgan odam do'kon egasimi (TELEGRAM_ADMIN_CHAT_ID ro'yxatida) */
export function isAdminChat(...ids: Array<number | string | undefined>): boolean {
  const admins = getAdminChatIds();
  return ids.some((id) => id !== undefined && admins.includes(String(id)));
}

/** Telegram inline tugmalari faqat ochiq HTTPS manzillarni qabul qiladi */
export function getPublicAppUrl(): string | null {
  const url = process.env.APP_URL?.replace(/\/$/, "");
  return url?.startsWith("https://") ? url : null;
}

type SendOptions = { keyboard?: InlineKeyboardMarkup };

export async function sendHtmlMessage(chatId: string | number, html: string, options: SendOptions = {}) {
  const telegram = getTelegram();
  if (!telegram) return;
  await telegram.sendMessage(chatId, html, {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: options.keyboard,
  });
}

/** Do'kon egasi(lari)ga xabar yuboradi. Xatolar log qilinadi, tashlanmaydi. */
export async function notifyAdmins(html: string, options: SendOptions = {}) {
  const chatIds = getAdminChatIds();
  if (!getTelegram() || chatIds.length === 0) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN yoki TELEGRAM_ADMIN_CHAT_ID o'rnatilmagan — xabar yuborilmadi");
    return;
  }
  const results = await Promise.allSettled(chatIds.map((id) => sendHtmlMessage(id, html, options)));
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[telegram] ${chatIds[i]} ga xabar yuborilmadi:`, result.reason);
    }
  });
}
