"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import { getDictionary, type Dictionary } from "./index";

const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t: getDictionary(locale) }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n I18nProvider ichida ishlatilishi kerak");
  return context;
}
