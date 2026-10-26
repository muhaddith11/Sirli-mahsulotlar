"use client";

import { useI18n } from "@/i18n/provider";
import { useMainButton } from "@/hooks/use-main-button";
import { useTelegram } from "@/providers/telegram-provider";

/** Muvaffaqiyat sahifasida Mini App'ni yopish uchun MainButton */
export function TelegramCloseButton() {
  const { webApp } = useTelegram();
  const { t } = useI18n();
  useMainButton({ text: t.common.close, onClick: () => webApp?.close() });
  return null;
}
