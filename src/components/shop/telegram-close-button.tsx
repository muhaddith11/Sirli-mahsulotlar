"use client";

import { useMainButton } from "@/hooks/use-main-button";
import { useTelegram } from "@/providers/telegram-provider";

/** Muvaffaqiyat sahifasida Mini App'ni yopish uchun MainButton */
export function TelegramCloseButton() {
  const { webApp } = useTelegram();
  useMainButton({ text: "Yopish", onClick: () => webApp?.close() });
  return null;
}
