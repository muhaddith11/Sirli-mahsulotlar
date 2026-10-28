"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword, createAdminSession, destroyAdminSession } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isAdminChat } from "@/lib/telegram/bot";
import { verifyTelegramInitData } from "@/lib/telegram/init-data";
import type { ActionResult } from "./types";

/** Telegram'dan kirishda initData shu muddatdan eski bo'lmasin (soniya) */
const TELEGRAM_LOGIN_MAX_AGE = 60 * 60;

/** Parol tanlashga qarshi: bitta IP'dan 15 daqiqada 10 ta urinish. Chegaradan oshsa — xato matni. */
async function loginRateLimit(): Promise<string | null> {
  try {
    await enforceRateLimit("admin-login", 10, 15 * 60);
    return null;
  } catch (error) {
    if (error instanceof AppError) return "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring.";
    throw error;
  }
}

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const limited = await loginRateLimit();
  if (limited) return { ok: false, error: limited };
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    // Parol tanlashni sekinlashtirish uchun kichik kechikish
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: false, error: "Parol noto'g'ri" };
  }
  await createAdminSession();
  redirect("/admin");
}

/**
 * Botdagi "Admin panel" tugmasi (Mini App) orqali parolsiz kirish: initData imzosi bot tokeni bilan
 * tekshiriladi va foydalanuvchi TELEGRAM_ADMIN_CHAT_ID ro'yxatida bo'lsagina sessiya ochiladi.
 */
export async function telegramLoginAction(initData: unknown): Promise<ActionResult> {
  const limited = await loginRateLimit();
  if (limited) return { ok: false, error: limited };
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const user =
    botToken && typeof initData === "string" && initData.length <= 4096
      ? verifyTelegramInitData(initData, botToken, TELEGRAM_LOGIN_MAX_AGE)
      : null;
  if (!user || !isAdminChat(user.id)) {
    return { ok: false, error: "Bu Telegram akkaunt do'kon egasi sifatida ro'yxatda yo'q. Parol bilan kiring." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
