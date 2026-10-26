import { LOCALE_COOKIE, type Locale } from "./config";

/** Til cookie'sini yozadi. Telegram Web Mini App'ni iframe'da ochadi — HTTPS'da SameSite=None kerak. */
export function writeLocaleCookie(locale: Locale) {
  const secure = window.location.protocol === "https:";
  document.cookie = [
    `${LOCALE_COOKIE}=${locale}`,
    "path=/",
    `max-age=${60 * 60 * 24 * 365}`,
    secure ? "SameSite=None; Secure" : "SameSite=Lax",
  ].join("; ");
}

export function hasLocaleCookie(): boolean {
  return document.cookie.split("; ").some((part) => part.startsWith(`${LOCALE_COOKIE}=`));
}
