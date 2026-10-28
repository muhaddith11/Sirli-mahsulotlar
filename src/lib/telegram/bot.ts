import "server-only";
import { Telegram } from "telegraf";
import type { InlineKeyboardButton, InlineKeyboardMarkup } from "telegraf/types";
import { ADMIN_COMMANDS } from "./commands";

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

/**
 * "Admin panel" tugmasi. Shaxsiy chatda Mini App bo'lib ochiladi va egasi Telegram orqali parolsiz kiradi;
 * guruhda web_app tugmasi ishlamaydi — u yerda oddiy havola (brauzerda, parol bilan).
 */
export function adminPanelButton(appUrl: string, chatType: string): InlineKeyboardButton {
  const url = `${appUrl}/admin/login`;
  return chatType === "private" ? { text: "⚙️ Admin panel", web_app: { url } } : { text: "⚙️ Admin panel", url };
}

/** Egasi chatining buyruqlar menyusiga /admin qo'shadi (faqat shu chatda ko'rinadi) */
export async function setAdminCommands(chatId: number | string) {
  await getTelegram()?.setMyCommands(ADMIN_COMMANDS, { scope: { type: "chat", chat_id: chatId } });
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
