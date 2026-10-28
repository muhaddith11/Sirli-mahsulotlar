"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { loginAction, telegramLoginAction } from "@/actions/admin/auth";
import { INITIAL_ACTION_RESULT } from "@/actions/admin/types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_ACTION_RESULT);
  const [telegramPending, startTelegramLogin] = useTransition();
  const [telegramError, setTelegramError] = useState<string>();

  // Botdagi "Admin panel" tugmasidan (Mini App) ochilgan bo'lsa — Telegram orqali parolsiz kirish
  useEffect(() => {
    let cancelled = false;
    import("@twa-dev/sdk")
      .then(({ default: WebApp }) => {
        if (cancelled || !WebApp.initData) return;
        WebApp.ready();
        WebApp.expand();
        startTelegramLogin(async () => {
          // Muvaffaqiyatda server /admin ga yo'naltiradi; aks holda parol formasi qoladi
          const result = await telegramLoginAction(WebApp.initData);
          if (!cancelled) setTelegramError(result.error);
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (telegramPending) {
    return (
      <p className="mt-6 flex h-12 items-center justify-center gap-2 text-sm font-semibold text-ink-2">
        <LoaderCircle className="size-5 animate-spin" />
        Telegram orqali kirilmoqda…
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-3">
      {telegramError && (
        <p className="rounded-[var(--radius-field)] bg-warning-soft px-3 py-2 text-sm text-warning">{telegramError}</p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Parol</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="h-12 w-full rounded-[var(--radius-card)] border border-line bg-page px-4 outline-none focus:border-brand focus:bg-surface focus:ring-4 focus:ring-brand/15"
        />
      </label>
      {state.error && <p className="text-sm font-semibold text-brand">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-field)] bg-ink font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {pending && <LoaderCircle className="size-5 animate-spin" />}
        Kirish
      </button>
    </form>
  );
}
