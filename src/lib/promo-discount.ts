// Server va klientda bir xil ishlaydigan promokod chegirmasi hisobi

export type PromoTerms = { type: "PERCENT" | "FIXED"; value: number; minOrder: number | null };

/** Promokod chegirmasi (so'm), mahsulotlar summasidan oshmaydi; eng kam summa yetmasa — 0 */
export function promoDiscountFor(promo: PromoTerms, amount: number): number {
  if (promo.minOrder != null && amount < promo.minOrder) return 0;
  const raw = promo.type === "PERCENT" ? Math.floor((amount * promo.value) / 100) : promo.value;
  return Math.max(0, Math.min(raw, amount));
}
