import { describe, expect, it } from "vitest";
import { checkoutSchema, productQuerySchema } from "@/lib/validation";

const base = { name: "Dilnoza", phone: "90 123 45 67" };

describe("checkout validatsiyasi", () => {
  it("yetkazishda viloyat va manzil shart", () => {
    const result = checkoutSchema.safeParse({ ...base, deliveryMethod: "DELIVERY" });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain("zoneRequired");
    expect(messages).toContain("addressShort");
  });

  it("olib ketishda manzil kerak emas, telefon normallashadi", () => {
    const result = checkoutSchema.parse({ ...base, deliveryMethod: "PICKUP" });
    expect(result.phone).toBe("+998901234567");
    expect(result.address).toBe("");
  });

  it("bo'sh promokod e'tiborsiz qoldiriladi", () => {
    const result = checkoutSchema.parse({ ...base, deliveryMethod: "PICKUP", promoCode: "  " });
    expect(result.promoCode).toBeUndefined();
  });

  it("noto'g'ri telefon — lug'at kodi bilan xato", () => {
    const result = checkoutSchema.safeParse({ ...base, phone: "123", deliveryMethod: "PICKUP" });
    expect(result.error?.issues[0]?.message).toBe("phoneInvalid");
  });
});

describe("katalog so'rovi", () => {
  it("bo'sh parametrlar standart qiymatga tushadi", () => {
    const query = productQuerySchema.parse({ q: "", minPrice: "", page: "" });
    expect(query).toMatchObject({ sort: "popular", page: 1, limit: 12 });
    expect(query.q).toBeUndefined();
    expect(query.minPrice).toBeUndefined();
  });

  it("limit 50 dan oshmaydi", () => {
    expect(productQuerySchema.safeParse({ limit: "500" }).success).toBe(false);
  });
});
