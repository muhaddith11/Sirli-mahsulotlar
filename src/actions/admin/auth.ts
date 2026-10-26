"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword, createAdminSession, destroyAdminSession } from "@/lib/auth";
import type { ActionResult } from "./types";

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
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
