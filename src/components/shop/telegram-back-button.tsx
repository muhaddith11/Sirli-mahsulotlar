"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTelegram } from "@/providers/telegram-provider";

/** Mini App ichida bosh sahifadan boshqa joyda Telegram'ning "Orqaga" tugmasini ko'rsatadi */
export function TelegramBackButton() {
  const { webApp } = useTelegram();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!webApp) return;
    const button = webApp.BackButton;
    if (pathname === "/") {
      button.hide();
      return;
    }
    const handler = () => (window.history.length > 1 ? router.back() : router.push("/"));
    button.onClick(handler);
    button.show();
    return () => {
      button.offClick(handler);
    };
  }, [webApp, pathname, router]);

  return null;
}
