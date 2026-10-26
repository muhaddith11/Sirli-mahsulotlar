export const LOCALES = ["uz", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "uz";
export const LOCALE_COOKIE = "lang";

export const LOCALE_NAMES: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** "Omborda {count} dona" + { count: 3 } → "Omborda 3 dona" */
export function fill(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/** Ruscha ko'plik shakli: [товар, товара, товаров]. O'zbekchada shakl o'zgarmaydi. */
export function plural(locale: Locale, count: number, forms: readonly [string, string, string] | string): string {
  if (typeof forms === "string") return forms;
  if (locale !== "ru") return forms[0];
  const rule = new Intl.PluralRules("ru").select(count);
  return rule === "one" ? forms[0] : rule === "few" ? forms[1] : forms[2];
}

/** Mahsulot/kategoriya nomini tilga qarab tanlaydi (ruscha bo'lmasa — o'zbekcha) */
export function localized(locale: Locale, uz: string, ru: string | null | undefined): string {
  return locale === "ru" && ru ? ru : uz;
}
