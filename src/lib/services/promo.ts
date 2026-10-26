import "server-only";
import { AppError } from "@/lib/errors";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { promoDiscountFor } from "@/lib/promo-discount";

type Db = Pick<typeof prisma, "promoCode">;

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export { promoDiscountFor } from "@/lib/promo-discount";

/**
 * Promokodni topadi va shu summa uchun yaroqliligini tekshiradi.
 * Yaroqsiz bo'lsa — mijoz tilida ko'rsatiladigan AppError tashlaydi.
 */
export async function findApplicablePromo(code: string, amount: number, db: Db = prisma) {
  const promo = await db.promoCode.findUnique({ where: { code: normalizePromoCode(code) } });
  if (!promo || !promo.isActive) throw new AppError("promoNotFound", 404);

  const now = new Date();
  if ((promo.startsAt && promo.startsAt > now) || (promo.endsAt && promo.endsAt < now)) {
    throw new AppError("promoExpired", 409);
  }
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) throw new AppError("promoUsedUp", 409);
  if (promo.minOrder != null && amount < promo.minOrder) {
    throw new AppError("promoMinOrder", 409, { amount: formatPrice(promo.minOrder) });
  }

  return { promo, discount: promoDiscountFor(promo, amount) };
}
