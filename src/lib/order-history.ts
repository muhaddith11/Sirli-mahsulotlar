// Saytda (Telegramsiz) berilgan buyurtmalarni brauzer eslab qoladi
const KEY = "sirli:orders";

export function rememberOrder(orderId: string) {
  try {
    const ids = readOrderIds().filter((id) => id !== orderId);
    localStorage.setItem(KEY, JSON.stringify([orderId, ...ids].slice(0, 30)));
  } catch {
    // localStorage bo'lmasligi mumkin (maxfiy rejim) — tarix shunchaki saqlanmaydi
  }
}

export function readOrderIds(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}
