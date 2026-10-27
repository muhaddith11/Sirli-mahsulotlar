import { z } from "zod";
import { DISH_TYPES, ORDER_STATUSES, PRODUCT_SORTS } from "./constants";
import { normalizePhone } from "./format";
import { SPIN_MAX_FRAMES } from "./spin";

/** Bo'sh satrni undefined'ga aylantiradi (formalar va query parametrlar uchun) */
const emptyToUndefined = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

const optionalInt = (min = 0) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).optional());

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional(),
  );

// ─── Katalog ────────────────────────────────────────────

export const productQuerySchema = z.object({
  q: optionalText(100),
  category: optionalText(80),
  minPrice: optionalInt(),
  maxPrice: optionalInt(),
  sort: z.preprocess(emptyToUndefined, z.enum(PRODUCT_SORTS).default("popular")),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(12)),
  featured: z.preprocess((v) => v === "1" || v === "true" || v === true, z.boolean()).optional(),
  discounted: z.preprocess((v) => v === "1" || v === "true" || v === true, z.boolean()).optional(),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;

// ─── Savat ──────────────────────────────────────────────

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Mahsulot ko'rsatilmagan"),
  quantity: z.coerce.number().int().min(1).max(99, "quantityMax").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99, "quantityMax"),
});

// ─── Checkout ───────────────────────────────────────────

export const phoneSchema = z
  .string({ error: "phoneInvalid" })
  .trim()
  .transform((value, ctx) => {
    const phone = normalizePhone(value);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "phoneInvalid" });
      return z.NEVER;
    }
    return phone;
  });

export const promoCodeSchema = z.string().trim().min(2, "promoNotFound").max(32, "promoNotFound");

export const checkoutSchema = z
  .object({
    name: z.string({ error: "nameRequired" }).trim().min(2, "nameRequired").max(100, "nameTooLong"),
    phone: phoneSchema,
    deliveryMethod: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
    zoneId: optionalText(40),
    address: z.string().trim().max(500, "addressTooLong").default(""),
    comment: optionalText(500),
    promoCode: z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), promoCodeSchema.optional()),
    /** Telegram.WebApp.initData — Mini App ichida bo'lsa yuboriladi */
    initData: z.string().max(4096).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "DELIVERY") return;
    // Viloyat majburiyligi servisda tekshiriladi: hududlar kiritilmagan bo'lsa, talab qilinmaydi
    if (data.address.length < 5) ctx.addIssue({ code: "custom", path: ["address"], message: "addressShort" });
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ─── Admin ──────────────────────────────────────────────

export const productFormSchema = z
  .object({
    id: optionalText(40),
    name: z.string().trim().min(2, "Nomini kiriting").max(150),
    nameRu: optionalText(150),
    slug: optionalText(80),
    sku: optionalText(40),
    categoryId: z.string().min(1, "Kategoriyani tanlang"),
    description: z.string().trim().max(5000).default(""),
    descriptionRu: optionalText(5000),
    price: z.coerce.number({ error: "Narxni kiriting" }).int("Butun son kiriting").min(1, "Narx 0 dan katta bo'lsin"),
    discountPrice: optionalInt(1),
    stock: z.coerce.number().int("Butun son kiriting").min(0, "Qoldiq manfiy bo'lishi mumkin emas"),
    volume: optionalText(40),
    pieces: optionalInt(1),
    images: z.array(z.string().trim().min(1).max(500)).max(10, "Ko'pi bilan 10 ta rasm"),
    spinFrames: z.array(z.string().trim().min(1).max(500)).max(SPIN_MAX_FRAMES, "360° kadrlari juda ko'p"),
    spinCutout: z.boolean(),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
  })
  .refine((d) => d.discountPrice == null || d.discountPrice < d.price, {
    path: ["discountPrice"],
    message: "Chegirma narxi asosiy narxdan kichik bo'lishi kerak",
  });
export type ProductFormInput = z.infer<typeof productFormSchema>;

export const categoryFormSchema = z.object({
  id: optionalText(40),
  name: z.string().trim().min(2, "Nomini kiriting").max(80),
  nameRu: optionalText(80),
  slug: optionalText(80),
  dishType: z.enum(DISH_TYPES),
  volume: optionalText(40),
  collectionName: optionalText(80),
  description: optionalText(500),
  image: optionalText(500),
  sortOrder: z.preprocess(emptyToUndefined, z.coerce.number().int().default(0)),
});

export const orderStatusSchema = z.enum(ORDER_STATUSES);
