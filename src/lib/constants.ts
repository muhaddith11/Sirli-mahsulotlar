import type { DishType, OrderSource, OrderStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";

export const SHOP_NAME = "Sirli Mahsulotlar";
export const CART_COOKIE = "cart_id";
export const LOW_STOCK_THRESHOLD = 5;
export const CATALOG_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

export const ORDER_STATUSES = [
  "NEW",
  "PREPARING",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Yangi",
  PREPARING: "Tayyorlanmoqda",
  DELIVERING: "Yetkazilmoqda",
  COMPLETED: "Yakunlandi",
  CANCELLED: "Bekor qilindi",
};

export const ORDER_STATUS_EMOJI: Record<OrderStatus, string> = {
  NEW: "🆕",
  PREPARING: "👩‍🍳",
  DELIVERING: "🚚",
  COMPLETED: "✅",
  CANCELLED: "❌",
};

/** Admin paneldagi status belgilari uchun Tailwind klasslari */
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  NEW: "bg-info-soft text-info ring-info/20",
  PREPARING: "bg-warning-soft text-warning ring-warning/20",
  DELIVERING: "bg-transit-soft text-transit ring-transit/20",
  COMPLETED: "bg-success-soft text-success ring-success/20",
  CANCELLED: "bg-page text-ink-3 ring-line-strong",
};

export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  WEB: "Sayt",
  TELEGRAM: "Telegram",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Qabul qilganda",
  CARD: "Kartaga o'tkazma",
};

/** Kartaga o'tkazmaning holati (admin panel va do'kon egasi xabarlari uchun) */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Chek kutilmoqda",
  REVIEW: "Chek yuborildi — tekshiring",
  PAID: "To'lov tasdiqlangan",
  REJECTED: "Chek rad etilgan",
};

export const PAYMENT_STATUS_EMOJI: Record<PaymentStatus, string> = {
  UNPAID: "⏳",
  REVIEW: "🧾",
  PAID: "✅",
  REJECTED: "❌",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  UNPAID: "bg-page text-ink-2 ring-line-strong",
  REVIEW: "bg-warning-soft text-warning ring-warning/20",
  PAID: "bg-success-soft text-success ring-success/20",
  REJECTED: "bg-brand-soft text-brand ring-brand/20",
};

export const DISH_TYPES = [
  "POT",
  "SET",
  "KETTLE",
  "BOWL",
  "MUG",
  "LADLE",
  "PAN",
  "OTHER",
] as const satisfies readonly DishType[];

export const DISH_TYPE_LABELS: Record<DishType, string> = {
  POT: "Kastryulka",
  SET: "To'plam",
  KETTLE: "Choynak",
  BOWL: "Tog'ora / kosa",
  MUG: "Krujka",
  LADLE: "Kovsh",
  PAN: "Tova",
  OTHER: "Boshqa",
};

export const PRODUCT_SORTS = ["popular", "new", "price_asc", "price_desc"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const PRODUCT_SORT_LABELS: Record<ProductSort, string> = {
  popular: "Ommabop",
  new: "Yangi kelganlar",
  price_asc: "Avval arzonlari",
  price_desc: "Avval qimmatlari",
};
