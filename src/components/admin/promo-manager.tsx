"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, Power, Trash2 } from "lucide-react";
import { createPromoAction, deletePromoAction, togglePromoAction } from "@/actions/admin/promo";
import { INITIAL_ACTION_RESULT } from "@/actions/admin/types";
import { cn } from "@/lib/cn";
import { adminInput, Field } from "./form-fields";

export function PromoCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createPromoAction, INITIAL_ACTION_RESULT);
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok) {
      toast.success("Promokod yaratildi");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Kod" hint="Masalan: BAHOR10" error={errors.code}>
        <input name="code" required className={cn(adminInput, "uppercase")} autoCapitalize="characters" />
      </Field>
      <Field label="Turi">
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}
          className={adminInput}
        >
          <option value="PERCENT">Foiz (%)</option>
          <option value="FIXED">Qat&apos;iy summa (so&apos;m)</option>
        </select>
      </Field>
      <Field label={type === "PERCENT" ? "Chegirma, %" : "Chegirma, so'm"} error={errors.value}>
        <input name="value" type="number" min={1} max={type === "PERCENT" ? 90 : undefined} required inputMode="numeric" className={adminInput} />
      </Field>
      <Field label="Eng kam buyurtma, so'm" hint="Ixtiyoriy" error={errors.minOrder}>
        <input name="minOrder" type="number" min={0} inputMode="numeric" className={adminInput} />
      </Field>
      <Field label="Necha marta ishlatiladi" hint="Bo'sh — cheksiz" error={errors.maxUses}>
        <input name="maxUses" type="number" min={1} inputMode="numeric" className={adminInput} />
      </Field>
      <Field label="Boshlanish" hint="Ixtiyoriy" error={errors.startsAt}>
        <input name="startsAt" type="date" className={adminInput} />
      </Field>
      <Field label="Tugash" hint="Ixtiyoriy" error={errors.endsAt}>
        <input name="endsAt" type="date" className={adminInput} />
      </Field>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-field)] bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          Yaratish
        </button>
      </div>
    </form>
  );
}

export function PromoRowActions({ id, code, isActive }: { id: string; code: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<{ ok: boolean; error?: string }>, message: string) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(message);
        router.refresh();
      } else {
        toast.error(result.error ?? "Xatolik");
      }
    });
  const button =
    "grid size-9 place-items-center rounded-[var(--radius-field)] text-ink-2 ring-1 ring-line transition hover:bg-page hover:text-ink disabled:opacity-40";

  return (
    <div className="flex justify-end gap-1.5">
      <button
        type="button"
        disabled={pending}
        className={button}
        onClick={() => run(() => togglePromoAction(id), isActive ? "O'chirib qo'yildi" : "Yoqildi")}
        aria-label={isActive ? "O'chirib qo'yish" : "Yoqish"}
        title={isActive ? "O'chirib qo'yish" : "Yoqish"}
      >
        <Power className="size-4" />
      </button>
      <button
        type="button"
        disabled={pending}
        className={`${button} hover:!bg-brand-soft hover:!text-brand`}
        onClick={() => {
          if (confirm(`«${code}» promokodi o'chirilsinmi? Buyurtmalardagi yozuv saqlanib qoladi.`)) {
            run(() => deletePromoAction(id), "Promokod o'chirildi");
          }
        }}
        aria-label="O'chirish"
        title="O'chirish"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
