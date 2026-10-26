// Server va klientda bir xil ishlaydigan yetkazish narxi hisobi

type ZonePrice = { price: number | null; freeFrom: number | null };

/**
 * Yetkazib berish narxi: hududda narx kiritilmagan bo'lsa — null ("operator aytadi"),
 * "bepul" chegarasidan oshsa — 0.
 */
export function deliveryFeeFor(zone: ZonePrice | null, amount: number): number | null {
  if (!zone || zone.price == null) return null;
  if (zone.freeFrom != null && amount >= zone.freeFrom) return 0;
  return zone.price;
}
