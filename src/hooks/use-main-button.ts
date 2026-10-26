"use client";

import { useEffect, useRef } from "react";
import { useTelegram } from "@/providers/telegram-provider";

type MainButtonOptions = {
  text: string;
  onClick: () => void;
  visible?: boolean;
  enabled?: boolean;
  loading?: boolean;
};

/**
 * Telegram'ning pastki "MainButton" tugmasini boshqaradi.
 * Telegram tashqarisida hech narsa qilmaydi va `false` qaytaradi —
 * shunda sahifa oddiy HTML tugmani ko'rsatadi.
 */
export function useMainButton({ text, onClick, visible = true, enabled = true, loading = false }: MainButtonOptions) {
  const { webApp } = useTelegram();
  const handlerRef = useRef(onClick);

  useEffect(() => {
    handlerRef.current = onClick;
  });

  useEffect(() => {
    if (!webApp) return;
    const button = webApp.MainButton;
    const handler = () => handlerRef.current();
    button.onClick(handler);
    return () => {
      button.offClick(handler);
      button.hideProgress();
      button.hide();
    };
  }, [webApp]);

  useEffect(() => {
    if (!webApp) return;
    const button = webApp.MainButton;
    button.setParams({
      text,
      color: "#b8322a",
      text_color: "#ffffff",
      is_active: enabled && !loading,
      is_visible: visible,
    });
    if (loading) button.showProgress(false);
    else button.hideProgress();
  }, [webApp, text, visible, enabled, loading]);

  return Boolean(webApp);
}
