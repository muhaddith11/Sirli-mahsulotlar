import type { DishType, OrderSource, OrderStatus } from "@/generated/prisma/enums";

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
  NEW: "bg-sky-100 text-sky-800 ring-sky-200",
  PREPARING: "bg-amber-100 text-amber-800 ring-amber-200",
  DELIVERING: "bg-violet-100 text-violet-800 ring-violet-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-stone-200 text-stone-600 ring-stone-300",
};

export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  WEB: "Sayt",
  TELEGRAM: "Telegram",
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
