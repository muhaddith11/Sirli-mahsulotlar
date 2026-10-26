import { describe, expect, it } from "vitest";
import { fill, localized, plural } from "@/i18n/config";
import ru from "@/i18n/dictionaries/ru";
import uz from "@/i18n/dictionaries/uz";

/** Lug'atdagi barcha kalit yo'llari: "cart.title", "catalog.sorts.popular", ... */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value) || typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

function placeholders(text: unknown): string[] {
  return typeof text === "string" ? [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort() : [];
}

function valueAt(dict: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], dict);
}

describe("lug'atlar", () => {
  it("o'zbekcha va ruscha lug'atda bir xil kalitlar bor", () => {
    expect(keyPaths(ru).sort()).toEqual(keyPaths(uz).sort());
  });

  it("har bir tarjimada o'rin almashtiruvchilar ({count}, {name}, ...) bir xil", () => {
    for (const path of keyPaths(uz)) {
      expect(placeholders(valueAt(ru, path)), path).toEqual(placeholders(valueAt(uz, path)));
    }
  });

  it("bo'sh tarjima yo'q", () => {
    for (const path of keyPaths(ru)) {
      const value = valueAt(ru, path);
      if (typeof value === "string") expect(value.trim(), path).not.toBe("");
    }
  });
});

describe("yordamchilar", () => {
  it("fill o'rin almashtiruvchilarni to'ldiradi, noma'lumini qoldiradi", () => {
    expect(fill("Omborda {count} dona", { count: 3 })).toBe("Omborda 3 dona");
    expect(fill("{a} va {b}", { a: 1 })).toBe("1 va {b}");
  });

  it("ruscha ko'plik shakllari", () => {
    const forms = ["{count} товар", "{count} товара", "{count} товаров"] as const;
    expect(plural("ru", 1, forms)).toBe(forms[0]);
    expect(plural("ru", 3, forms)).toBe(forms[1]);
    expect(plural("ru", 11, forms)).toBe(forms[2]);
    expect(plural("ru", 21, forms)).toBe(forms[0]);
    expect(plural("uz", 5, forms)).toBe(forms[0]);
  });

  it("ruscha nom bo'lmasa o'zbekchasi ishlatiladi", () => {
    expect(localized("ru", "Kastryulkalar", "Кастрюли")).toBe("Кастрюли");
    expect(localized("ru", "Kastryulkalar", null)).toBe("Kastryulkalar");
    expect(localized("uz", "Kastryulkalar", "Кастрюли")).toBe("Kastryulkalar");
  });
});
