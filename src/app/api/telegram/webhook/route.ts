import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { Update } from "telegraf/types";
import { readJson } from "@/lib/api";
import { SHOP_NAME } from "@/lib/constants";
import { getPublicAppUrl, sendHtmlMessage } from "@/lib/telegram/bot";

function isAuthorized(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = request.headers.get("x-telegram-bot-api-secret-token");
  if (!expected || !received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/telegram/webhook — bot buyruqlari:
 *   /start — do'konni ochish tugmasi
 *   /id    — chat ID (TELEGRAM_ADMIN_CHAT_ID uchun)
 * Webhook'ni `npm run bot:setup` o'rnatadi.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ ok: false }, { status: 401 });

  const update = (await readJson(request)) as Update;
  const message = "message" in update ? update.message : undefined;
  const text = message && "text" in message ? message.text : "";
  const chatId = message?.chat.id;

  try {
    if (chatId && text.startsWith("/start")) {
      const appUrl = getPublicAppUrl();
      await sendHtmlMessage(
        chatId,
        `Assalomu alaykum! 🌸\n<b>${SHOP_NAME}</b> — emal kastryulkalar, choynaklar va oshxona idishlari do'koni.\n\nPastdagi tugma orqali katalogni oching va bir necha bosishda buyurtma bering.`,
        appUrl ? { keyboard: { inline_keyboard: [[{ text: "🛍 Do'konni ochish", web_app: { url: appUrl } }]] } } : {},
      );
    } else if (chatId && text.startsWith("/id")) {
      await sendHtmlMessage(chatId, `Chat ID: <code>${chatId}</code>`);
    }
  } catch (error) {
    console.error("[telegram] webhook xatosi:", error);
  }

  // Telegram qayta yubormasligi uchun har doim 200 qaytaramiz
  return NextResponse.json({ ok: true });
}
