import "server-only";
import type { InlineKeyboardButton, InlineKeyboardMarkup } from "telegraf/types";
import type { OrderStatus } from "@/generated/prisma/enums";
import { ORDER_STATUS_EMOJI, ORDER_STATUS_LABELS } from "@/lib/constants";
import { getPublicAppUrl } from "./bot";

/**
 * Callback ma'lumoti (64 baytgacha):
 *   st:<orderId>:<STATUS> — holatni o'zgartirish
 *   cx:<orderId>          — bekor qilishni so'rash (tasdiqlash tugmalari chiqadi)
 *   back:<orderId>        — tasdiqlashdan qaytish
 */
export type OrderCallback =
  | { action: "status"; orderId: string; status: OrderStatus }
  | { action: "askCancel"; orderId: string }
  | { action: "back"; orderId: string };

const STATUSES: readonly OrderStatus[] = ["NEW", "PREPARING", "DELIVERING", "COMPLETED", "CANCELLED"];

export function parseOrderCallback(data: string | undefined): OrderCallback | null {
  if (!data) return null;
  const [kind, orderId, status] = data.split(":");
  if (!orderId) return null;
  if (kind === "st" && STATUSES.includes(status as OrderStatus)) {
    return { action: "status", orderId, status: status as OrderStatus };
  }
  if (kind === "cx") return { action: "askCancel", orderId };
  if (kind === "back") return { action: "back", orderId };
  return null;
}

/** Keyingi mantiqiy qadamlar: faqat oldinga yuriladi, bekor qilish — alohida tasdiq bilan */
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["PREPARING", "DELIVERING", "COMPLETED"],
  PREPARING: ["DELIVERING", "COMPLETED"],
  DELIVERING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

function statusButton(orderId: string, status: OrderStatus): InlineKeyboardButton {
  return { text: `${ORDER_STATUS_EMOJI[status]} ${ORDER_STATUS_LABELS[status]}`, callback_data: `st:${orderId}:${status}` };
}

function adminLinkRow(orderId: string): InlineKeyboardButton[] {
  const appUrl = getPublicAppUrl();
  return appUrl ? [{ text: "📋 Admin panelda ochish", url: `${appUrl}/admin/orders/${orderId}` }] : [];
}

/** Do'kon egasi xabaridagi tugmalar. Olib ketiladigan buyurtmada "Yetkazilmoqda" bosqichi yo'q. */
export function orderAdminKeyboard(
  orderId: string,
  status: OrderStatus,
  deliveryMethod: "DELIVERY" | "PICKUP" = "DELIVERY",
): InlineKeyboardMarkup {
  const rows: InlineKeyboardButton[][] = [];
  const next = NEXT[status].filter((s) => deliveryMethod === "DELIVERY" || s !== "DELIVERING");
  if (next.length > 0) rows.push(next.slice(0, 2).map((s) => statusButton(orderId, s)));
  if (next.length > 2) rows.push(next.slice(2).map((s) => statusButton(orderId, s)));
  if (status !== "COMPLETED" && status !== "CANCELLED") {
    rows.push([{ text: "❌ Bekor qilish", callback_data: `cx:${orderId}` }]);
  }
  const link = adminLinkRow(orderId);
  if (link.length) rows.push(link);
  return { inline_keyboard: rows };
}

/** "Bekor qilinsinmi?" tasdiqlash tugmalari */
export function cancelConfirmKeyboard(orderId: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "✅ Ha, bekor qilinsin", callback_data: `st:${orderId}:CANCELLED` },
        { text: "↩️ Yo'q", callback_data: `back:${orderId}` },
      ],
    ],
  };
}
