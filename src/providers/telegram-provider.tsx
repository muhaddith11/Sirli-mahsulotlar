"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type WebApp = (typeof import("@twa-dev/sdk"))["default"];

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
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

const BRAND_BG = "#fbf6ee";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
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
          WebApp.setHeaderColor(BRAND_BG);
          WebApp.setBackgroundColor(BRAND_BG);
        }
        if (WebApp.isVersionAtLeast("7.7")) WebApp.disableVerticalSwipes();
        if (WebApp.isVersionAtLeast("7.10")) WebApp.setBottomBarColor("#ffffff");
        document.documentElement.dataset.telegram = "true";

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
  }, []);

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
