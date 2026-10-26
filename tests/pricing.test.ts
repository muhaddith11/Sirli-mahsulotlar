import { describe, expect, it } from "vitest";
import { deliveryFeeFor } from "@/lib/delivery-fee";
import { promoDiscountFor } from "@/lib/promo-discount";

describe("yetkazib berish narxi", () => {
  it("hudud tanlanmagan yoki narx kiritilmagan — null (operator aytadi)", () => {
    expect(deliveryFeeFor(null, 100000)).toBeNull();
    expect(deliveryFeeFor({ price: null, freeFrom: 500000 }, 900000)).toBeNull();
  });

  it("narx bor — narx; bepul chegarasidan oshsa — 0", () => {
    const zone = { price: 25000, freeFrom: 500000 };
    expect(deliveryFeeFor(zone, 499999)).toBe(25000);
    expect(deliveryFeeFor(zone, 500000)).toBe(0);
    expect(deliveryFeeFor({ price: 30000, freeFrom: null }, 10_000_000)).toBe(30000);
  });
});

describe("promokod chegirmasi", () => {
  it("foiz pastga yaxlitlanadi", () => {
    expect(promoDiscountFor({ type: "PERCENT", value: 10, minOrder: null }, 599000)).toBe(59900);
    expect(promoDiscountFor({ type: "PERCENT", value: 15, minOrder: null }, 45001)).toBe(6750);
  });

  it("qat'iy summa mahsulotlar summasidan oshmaydi", () => {
    expect(promoDiscountFor({ type: "FIXED", value: 50000, minOrder: null }, 300000)).toBe(50000);
    expect(promoDiscountFor({ type: "FIXED", value: 50000, minOrder: null }, 30000)).toBe(30000);
  });

  it("eng kam summa yetmasa chegirma yo'q", () => {
    expect(promoDiscountFor({ type: "PERCENT", value: 10, minOrder: 500000 }, 499000)).toBe(0);
    expect(promoDiscountFor({ type: "PERCENT", value: 10, minOrder: 500000 }, 500000)).toBe(50000);
  });
});
