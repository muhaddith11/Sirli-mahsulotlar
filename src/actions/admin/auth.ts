"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword, createAdminSession, destroyAdminSession } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "./types";

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    // Parol tanlashga qarshi: bitta IP'dan 15 daqiqada 10 ta urinish
    await enforceRateLimit("admin-login", 10, 15 * 60);
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." };
    throw error;
  }
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    // Parol tanlashni sekinlashtirish uchun kichik kechikish
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: false, error: "Parol noto'g'ri" };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
