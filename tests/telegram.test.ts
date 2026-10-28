import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { adminPanelButton, isAdminChat } from "@/lib/telegram/bot";
import { verifyTelegramInitData } from "@/lib/telegram/init-data";
import { escapeHtml, newOrderMessage, type OrderForMessage } from "@/lib/telegram/messages";
import { orderAdminKeyboard, parseOrderCallback } from "@/lib/telegram/order-keyboard";

const TOKEN = "123456:TEST-TOKEN";

function signInitData(fields: Record<string, string>, token = TOKEN) {
  const params = new URLSearchParams(fields);
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  params.set("hash", createHmac("sha256", secret).update(dataCheckString).digest("hex"));
  return params;
}

const freshFields = () => ({
  auth_date: String(Math.floor(Date.now() / 1000)),
  query_id: "AAE",
  user: JSON.stringify({ id: 42, first_name: "Ali", username: "ali", language_code: "ru" }),
});

describe("Telegram initData", () => {
  it("to'g'ri imzo — foydalanuvchi qaytadi", () => {
    expect(verifyTelegramInitData(signInitData(freshFields()).toString(), TOKEN)).toMatchObject({ id: 42, username: "ali" });
  });

  it("boshqa token yoki o'zgartirilgan ma'lumot rad etiladi", () => {
    const signed = signInitData(freshFields());
    expect(verifyTelegramInitData(signed.toString(), "999:OTHER")).toBeNull();
    signed.set("user", JSON.stringify({ id: 1, first_name: "Hacker" }));
    expect(verifyTelegramInitData(signed.toString(), TOKEN)).toBeNull();
  });

  it("eskirgan (24 soatdan oshgan) ma'lumot rad etiladi", () => {
    const old = { ...freshFields(), auth_date: String(Math.floor(Date.now() / 1000) - 2 * 24 * 3600) };
    expect(verifyTelegramInitData(signInitData(old).toString(), TOKEN)).toBeNull();
  });

  it("hash'siz satr rad etiladi", () => {
    expect(verifyTelegramInitData("user=%7B%7D", TOKEN)).toBeNull();
  });

  it("admin kirishi uchun qisqa muddat: 2 soatlik ma'lumot 1 soatlik chegaradan o'tmaydi", () => {
    const twoHours = { ...freshFields(), auth_date: String(Math.floor(Date.now() / 1000) - 2 * 3600) };
    const signed = signInitData(twoHours).toString();
    expect(verifyTelegramInitData(signed, TOKEN)).toMatchObject({ id: 42 });
    expect(verifyTelegramInitData(signed, TOKEN, 60 * 60)).toBeNull();
  });
});

describe("admin panel tugmasi", () => {
  it("shaxsiy chatda Mini App, guruhda oddiy havola", () => {
    expect(adminPanelButton("https://shop.uz", "private")).toMatchObject({ web_app: { url: "https://shop.uz/admin/login" } });
    expect(adminPanelButton("https://shop.uz", "supergroup")).toMatchObject({ url: "https://shop.uz/admin/login" });
  });

  it("faqat ro'yxatdagi chat admin hisoblanadi", () => {
    process.env.TELEGRAM_ADMIN_CHAT_ID = "111, -100222";
    expect(isAdminChat(111)).toBe(true);
    expect(isAdminChat(333, "-100222")).toBe(true);
    expect(isAdminChat(333, undefined)).toBe(false);
  });
});

describe("buyurtma tugmalari", () => {
  it("callback ma'lumotini o'qiydi", () => {
    expect(parseOrderCallback("st:abc:PREPARING")).toEqual({ action: "status", orderId: "abc", status: "PREPARING" });
    expect(parseOrderCallback("cx:abc")).toEqual({ action: "askCancel", orderId: "abc" });
    expect(parseOrderCallback("st:abc:HACKED")).toBeNull();
    expect(parseOrderCallback(undefined)).toBeNull();
  });

  const labels = (markup: ReturnType<typeof orderAdminKeyboard>) => markup.inline_keyboard.flat().map((b) => b.text);

  it("yangi buyurtmada oldinga qadamlar va bekor qilish bor", () => {
    const texts = labels(orderAdminKeyboard("o1", "NEW"));
    expect(texts.some((t) => t.includes("Tayyorlanmoqda"))).toBe(true);
    expect(texts.some((t) => t.includes("Yetkazilmoqda"))).toBe(true);
    expect(texts.some((t) => t.includes("Bekor qilish"))).toBe(true);
  });

  it("olib ketiladigan buyurtmada 'Yetkazilmoqda' yo'q", () => {
    expect(labels(orderAdminKeyboard("o1", "NEW", "PICKUP")).some((t) => t.includes("Yetkazilmoqda"))).toBe(false);
  });

  it("yakunlangan buyurtmada tugma yo'q", () => {
    expect(labels(orderAdminKeyboard("o1", "COMPLETED"))).toEqual([]);
  });
});

describe("do'kon egasi xabari", () => {
  const order: OrderForMessage = {
    number: 7,
    status: "NEW",
    source: "WEB",
    customerName: "Ali <script>",
    phone: "+998901234567",
    deliveryAddress: "Toshkent & co",
    comment: null,
    deliveryMethod: "DELIVERY",
    deliveryZoneName: "Toshkent shahri",
    deliveryFee: null,
    itemsAmount: 90000,
    promoCodeText: null,
    promoDiscount: 0,
    totalAmount: 90000,
    createdAt: new Date("2026-10-26T10:00:00Z"),
    items: [{ productName: 'Krujka "Limon" 400 ml', unitPrice: 45000, quantity: 2, totalPrice: 90000 }],
  };

  it("mijoz matni HTML sifatida qochiriladi", () => {
    const text = newOrderMessage(order);
    expect(text).toContain("Ali &lt;script&gt;");
    expect(text).toContain("Toshkent &amp; co");
    expect(text).not.toContain("<script>");
  });

  it("narxsiz hududda 'operator aytadi' va '+ yetkazish' yoziladi", () => {
    const text = newOrderMessage(order);
    expect(text).toContain("narxni operator aytadi");
    expect(text).toContain("+ yetkazish");
  });

  it("escapeHtml", () => {
    expect(escapeHtml("<b>&</b>")).toBe("&lt;b&gt;&amp;&lt;/b&gt;");
  });
});
