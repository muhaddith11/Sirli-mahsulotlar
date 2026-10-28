import type { BotCommand } from "telegraf/types";

/**
 * Faqat do'kon egasi chatida ko'rinadigan buyruqlar menyusi (scope: chat).
 * Boshqa foydalanuvchilar umumiy ro'yxatni ko'radi — /admin ularda yo'q.
 */
export const ADMIN_COMMANDS: BotCommand[] = [
  { command: "start", description: "Do'konni ochish" },
  { command: "admin", description: "Admin panelni ochish" },
  { command: "yangi", description: "Faol buyurtmalar" },
  { command: "id", description: "Chat ID'ni ko'rsatish" },
];
