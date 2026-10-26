// Server va klientda bir xil natija beradigan formatlash funksiyalari
// (Intl lokallariga bog'liq emas — gidratsiyada farq chiqmaydi).

export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatPrice(value: number): string {
  return `${formatNumber(value)} so'm`;
}

type Priced = { price: number; discountPrice: number | null };

/** Mijoz to'laydigan narx: chegirma bo'lsa — chegirma narxi */
export function effectivePrice(p: Priced): number {
  return p.discountPrice != null && p.discountPrice < p.price ? p.discountPrice : p.price;
}

export function discountPercent(p: Priced): number {
  const final = effectivePrice(p);
  if (final >= p.price) return 0;
  return Math.round(((p.price - final) / p.price) * 100);
}

/** "+998 90 123 45 67", "901234567", "998901234567" → "+998901234567" */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith("998")) return `+${digits}`;
  return null;
}

/** "+998901234567" → "+998 90 123 45 67" */
export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length !== 12) return phone;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
}

/** Telefon maydoni uchun yozish paytidagi format: "+998 90 123 45 67" */
export function formatPhoneInput(value: string): string {
  let d = value.replace(/\D/g, "");
  if (!d.startsWith("998")) d = `998${d}`;
  d = d.slice(0, 12);
  const parts = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
  return `+${parts.join(" ")}`;
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Tashkent",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Faqat serverda chaqiring (vaqt mintaqasi — Toshkent) */
export function formatDate(date: Date): string {
  return dateFormatter.format(date).replace(",", "");
}

const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "o", қ: "q", ғ: "g", ҳ: "h",
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((ch) => CYRILLIC[ch] ?? ch)
    .join("")
    .replace(/[ʻʼ'`‘’]/g, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
