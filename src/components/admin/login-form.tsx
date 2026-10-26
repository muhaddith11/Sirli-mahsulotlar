"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { loginAction } from "@/actions/admin/auth";
import { INITIAL_ACTION_RESULT } from "@/actions/admin/types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_ACTION_RESULT);

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Parol</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="h-12 w-full rounded-2xl border border-line bg-cream/40 px-4 outline-none focus:border-berry-500 focus:bg-white focus:ring-4 focus:ring-berry-100"
        />
      </label>
      {state.error && <p className="text-sm font-semibold text-berry-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-bold text-cream hover:bg-berry-700 disabled:opacity-60"
      >
        {pending && <LoaderCircle className="size-5 animate-spin" />}
        Kirish
      </button>
    </form>
  );
}
