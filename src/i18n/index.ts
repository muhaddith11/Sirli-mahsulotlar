import type { Locale } from "./config";
import ru from "./dictionaries/ru";
import uz, { type Dictionary } from "./dictionaries/uz";

export type { Dictionary };
export * from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { uz, ru };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
