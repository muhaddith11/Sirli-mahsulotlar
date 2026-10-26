/**
 * Telegram botni Mini App uchun sozlaydi:
 *   • menyu tugmasi ("Do'kon") → APP_URL
 *   • buyruqlar ro'yxati (o'zbekcha va ruscha)
 *   • webhook → APP_URL/api/telegram/webhook (xabarlar va tugma bosishlari)
 *
 * Ishga tushirish:  npm run bot:setup
 */
import "dotenv/config";
import { Telegram } from "telegraf";

const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.APP_URL?.replace(/\/$/, "");
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) throw new Error("TELEGRAM_BOT_TOKEN o'rnatilmagan");
if (!appUrl?.startsWith("https://")) {
  throw new Error("APP_URL https:// bilan boshlanishi kerak (Telegram Mini App faqat HTTPS'da ishlaydi)");
}

const telegram = new Telegram(token);

await telegram.setChatMenuButton({
  menuButton: { type: "web_app", text: "Do'kon", web_app: { url: appUrl } },
});
await telegram.setMyCommands([
  { command: "start", description: "Do'konni ochish" },
  { command: "yangi", description: "Faol buyurtmalar (do'kon egasi uchun)" },
  { command: "id", description: "Chat ID'ni ko'rsatish" },
]);
await telegram.setMyCommands(
  [
    { command: "start", description: "Открыть магазин" },
    { command: "yangi", description: "Активные заказы (для владельца)" },
    { command: "id", description: "Показать chat ID" },
  ],
  { language_code: "ru" },
);
await telegram.setWebhook(`${appUrl}/api/telegram/webhook`, {
  secret_token: secret,
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
});

const me = await telegram.getMe();
console.log(`✔ @${me.username} sozlandi: menyu tugmasi va webhook → ${appUrl}`);
