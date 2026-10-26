// Toshkent vaqti UTC+5 (yozgi vaqt yo'q)
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Toshkent vaqti bo'yicha bugungi kun boshlanishi (UTC Date) */
export function startOfTodayTashkent(now = Date.now()): Date {
  return new Date(Math.floor((now + TASHKENT_OFFSET_MS) / DAY_MS) * DAY_MS - TASHKENT_OFFSET_MS);
}

/** Toshkent vaqti bo'yicha joriy oy boshlanishi (UTC Date) */
export function startOfMonthTashkent(now = Date.now()): Date {
  const local = new Date(now + TASHKENT_OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - TASHKENT_OFFSET_MS);
}
