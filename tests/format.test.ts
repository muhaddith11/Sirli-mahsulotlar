import { describe, expect, it } from "vitest";
import {
  discountPercent,
  effectivePrice,
  formatPhone,
  formatPhoneInput,
  formatPrice,
  keepUnits,
  normalizePhone,
  slugify,
} from "@/lib/format";

const NBSP = " ";

describe("narx", () => {
  it("so'm va сум bilan, minglar probel bilan ajratiladi", () => {
    expect(formatPrice(1250000)).toBe("1 250 000 so'm");
    expect(formatPrice(45000, "ru")).toBe("45 000 сум");
  });

  it("chegirma narxi faqat asosiy narxdan kichik bo'lsa qo'llanadi", () => {
    expect(effectivePrice({ price: 385000, discountPrice: 329000 })).toBe(329000);
    expect(effectivePrice({ price: 100, discountPrice: null })).toBe(100);
    expect(effectivePrice({ price: 100, discountPrice: 150 })).toBe(100);
  });

  it("chegirma foizi yaxlitlanadi", () => {
    expect(discountPercent({ price: 690000, discountPrice: 599000 })).toBe(13);
    expect(discountPercent({ price: 100, discountPrice: null })).toBe(0);
  });
});

describe("telefon", () => {
  it.each([
    ["+998 90 123 45 67", "+998901234567"],
    ["901234567", "+998901234567"],
    ["998901234567", "+998901234567"],
  ])("%s → %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it("noto'g'ri raqam null qaytaradi", () => {
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("+7 999 123 45 67")).toBeNull();
  });

  it("ko'rsatish va yozish formati", () => {
    expect(formatPhone("+998901234567")).toBe("+998 90 123 45 67");
    expect(formatPhoneInput("90123")).toBe("+998 90 123");
    expect(formatPhoneInput("+998 90 123 45 67 89")).toBe("+998 90 123 45 67");
  });
});

describe("keepUnits", () => {
  it("raqam va birlik ajralmas probel bilan bog'lanadi", () => {
    expect(keepUnits('Kastryulka "Good Food" 4 L')).toBe(`Kastryulka "Good Food" 4${NBSP}L`);
    expect(keepUnits("to'plami (6 dona)")).toBe(`to'plami (6${NBSP}dona)`);
    expect(keepUnits("Набор «Мак» (6 предметов)")).toBe(`Набор «Мак» (6${NBSP}предметов)`);
    expect(keepUnits("Кружка 400 мл")).toBe(`Кружка 400${NBSP}мл`);
  });

  it("boshqa so'zlarga tegmaydi", () => {
    expect(keepUnits("Tog'ora Bahor 2026 yil")).toBe("Tog'ora Bahor 2026 yil");
  });
});

describe("slugify", () => {
  it("o'zbekcha apostrof va kirill harflarini lotin slug'ga aylantiradi", () => {
    expect(slugify("To'plam \"Ko'knori\" 6 dona")).toBe("toplam-koknori-6-dona");
    expect(slugify("Кастрюля Клубника")).toBe("kastryulya-klubnika");
  });
});
