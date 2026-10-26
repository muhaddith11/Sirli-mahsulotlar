"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasLocaleCookie, writeLocaleCookie } from "@/i18n/client";

export type WebApp = (typeof import("@twa-dev/sdk"))["default"];

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

type TelegramContextValue = {
  /** Telegram ichida ochilgan bo'lsa — WebApp obyekti, aks holda null */
  webApp: WebApp | null;
  user: TelegramUser | null;
  /** Server tomonda tekshiriladigan imzolangan satr */
  initData: string;
  /** SDK yuklanib, muhit aniqlangan */
  ready: boolean;
};

const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  user: null,
  initData: "",
  ready: false,
});

// Telegram sarlavhasi va foni sayt yuzalariga mos bo'lsin
const HEADER_BG = "#ffffff";
const PAGE_BG = "#f7f4ef";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [value, setValue] = useState<TelegramContextValue>({ webApp: null, user: null, initData: "", ready: false });

  useEffect(() => {
    let cancelled = false;

    // SDK `window`ga murojaat qiladi, shuning uchun faqat brauzerda yuklaymiz
    import("@twa-dev/sdk")
      .then(({ default: WebApp }) => {
        if (cancelled) return;
        if (!WebApp.initData) {
          setValue({ webApp: null, user: null, initData: "", ready: true });
          return;
        }

        WebApp.ready();
        WebApp.expand();
        if (WebApp.isVersionAtLeast("6.1")) {
          WebApp.setHeaderColor(HEADER_BG);
          WebApp.setBackgroundColor(PAGE_BG);
        }
        if (WebApp.isVersionAtLeast("7.7")) WebApp.disableVerticalSwipes();
        if (WebApp.isVersionAtLeast("7.10")) WebApp.setBottomBarColor("#ffffff");
        document.documentElement.dataset.telegram = "true";

        // Birinchi ochilishda tilni Telegram sozlamasidan olamiz (keyin foydalanuvchi o'zi almashtiradi)
        const languageCode = (WebApp.initDataUnsafe.user as TelegramUser | undefined)?.language_code;
        if (!hasLocaleCookie() && languageCode) {
          writeLocaleCookie(languageCode.startsWith("ru") ? "ru" : "uz");
          if (languageCode.startsWith("ru")) router.refresh();
        }

        setValue({
          webApp: WebApp,
          user: (WebApp.initDataUnsafe.user as TelegramUser | undefined) ?? null,
          initData: WebApp.initData,
          ready: true,
        });
      })
      .catch(() => {
        if (!cancelled) setValue((v) => ({ ...v, ready: true }));
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

export function useTelegram() {
  return useContext(TelegramContext);
}

type HapticKind = "success" | "error" | "warning" | "light" | "medium";

export function haptic(webApp: WebApp | null, kind: HapticKind) {
  if (!webApp?.isVersionAtLeast("6.1")) return;
  if (kind === "light" || kind === "medium") webApp.HapticFeedback.impactOccurred(kind);
  else webApp.HapticFeedback.notificationOccurred(kind);
}
