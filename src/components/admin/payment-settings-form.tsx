"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { savePaymentSettingsAction } from "@/actions/admin/payment";
import { INITIAL_ACTION_RESULT } from "@/actions/admin/types";
import { formatCardNumber } from "@/lib/format";
import { adminInput, Field } from "./form-fields";

export type PaymentSettingsValues = {
  cardNumber: string | null;
  cardHolder: string | null;
  paymentQr: string | null;
};

export function PaymentSettingsForm({ settings }: { settings: PaymentSettingsValues }) {
  const [state, formAction, pending] = useActionState(savePaymentSettingsAction, INITIAL_ACTION_RESULT);
  const [cardNumber, setCardNumber] = useState(formatCardNumber(settings.cardNumber ?? ""));
  const [qr, setQr] = useState(settings.paymentQr ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok) toast.success("To'lov ma'lumotlari saqlandi");
    else if (state.error) toast.error(state.error);
  }, [state]);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(data?.error ?? "QR rasm yuklanmadi");
        return;
      }
      setQr(data.url as string);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <form action={formAction} className="grid gap-5 md:grid-cols-[1fr_220px]">
      <div className="space-y-4">
        <Field label="Karta raqami" hint="Uzcard yoki Humo, 16 ta raqam" error={state.fieldErrors?.cardNumber}>
          <input
            name="cardNumber"
            inputMode="numeric"
            autoComplete="off"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value).slice(0, 19))}
            placeholder="8600 1234 5678 9012"
            className={`${adminInput} tabular text-base tracking-wide`}
          />
        </Field>
        <Field label="Karta egasi" hint="Mijoz o'tkazmada shu ismni ko'radi" error={state.fieldErrors?.cardHolder}>
          <input
            name="cardHolder"
            defaultValue={settings.cardHolder ?? ""}
            placeholder="ALIYEV ALI"
            className={adminInput}
          />
        </Field>
        <p className="rounded-[var(--radius-field)] bg-page p-3 text-xs leading-relaxed text-ink-2">
          Karta raqami yoki QR kiritilsa, checkout&apos;da «Kartaga o&apos;tkazma» varianti chiqadi. Mijoz to&apos;lab,
          chekni botga yuboradi — chek sizga Telegram&apos;da «Tasdiqlash / Rad etish» tugmalari bilan keladi. Ikkalasini
          ham bo&apos;shatsangiz, variant o&apos;chadi.
        </p>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-semibold">To&apos;lov QR kodi</span>
        <input type="hidden" name="paymentQr" value={qr} />
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
        {qr ? (
          <div className="relative aspect-square overflow-hidden rounded-[var(--radius-field)] bg-white ring-1 ring-line">
            <img src={qr} alt="To'lov QR kodi" className="size-full object-contain p-2" />
            <button
              type="button"
              onClick={() => setQr("")}
              aria-label="QR rasmni olib tashlash"
              className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-md bg-surface/90 text-brand shadow"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border-2 border-dashed border-line-strong text-sm font-semibold text-ink-2 hover:border-brand hover:text-brand disabled:opacity-60"
          >
            {uploading ? <LoaderCircle className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            {uploading ? "Yuklanmoqda…" : "QR rasm yuklash"}
          </button>
        )}
        {state.fieldErrors?.paymentQr && (
          <span className="mt-1 block text-xs font-semibold text-brand">{state.fieldErrors.paymentQr}</span>
        )}
        <span className="mt-1 block text-xs text-ink-3">Click, Payme yoki bank ilovasidagi QR skrinshoti</span>
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-field)] bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          Saqlash
        </button>
      </div>
    </form>
  );
}
