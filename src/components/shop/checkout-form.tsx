"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Info, LoaderCircle, Send } from "lucide-react";
import { localized } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useMainButton } from "@/hooks/use-main-button";
import { cn } from "@/lib/cn";
import { formatPhoneInput, formatPrice, keepUnits } from "@/lib/format";
import { rememberOrder } from "@/lib/order-history";
import { useCart } from "@/providers/cart-provider";
import { haptic, useTelegram } from "@/providers/telegram-provider";
import { OrderSummary } from "./order-summary";
import { ProductImage } from "./product-image";

type Values = { name: string; phone: string; address: string; comment: string };
type Errors = Partial<Record<keyof Values, string>>;

const STORAGE_KEY = "sirli:checkout-contact";

export function CheckoutForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { t, locale } = useI18n();
  const { cart, loaded, refresh } = useCart();
  const { webApp, user, initData } = useTelegram();
  const [values, setValues] = useState<Values>({ name: "", phone: "+998 ", address: "", comment: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Avvalgi buyurtmadagi kontaktlar va Telegram profilidan avtomatik to'ldirish
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Values> | null;
      if (saved) setValues((v) => ({ ...v, ...saved }));
    } catch {
      // localStorage mavjud bo'lmasligi mumkin (masalan, maxfiy rejim)
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
    setValues((v) => (v.name ? v : { ...v, name: fullName }));
  }, [user]);

  const set = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === "phone" ? formatPhoneInput(e.target.value) : e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrors({});
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, initData: initData || undefined }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.details) setErrors(data.details as Errors);
        haptic(webApp, "error");
        toast.error(data?.error ?? t.checkout.failed);
        if (response.status === 409) await refresh(); // qoldiq o'zgargan bo'lishi mumkin
        return;
      }

      try {
        const { name, phone, address } = values;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, phone, address }));
      } catch {}
      rememberOrder(data.orderId);
      setDone(true);
      haptic(webApp, "success");
      router.replace(`/checkout/success?id=${data.orderId}`);
      void refresh();
    } catch {
      toast.error(t.checkout.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  const empty = cart.items.length === 0;
  const totalText = formatPrice(cart.total, locale);

  const inTelegram = useMainButton({
    text: `${t.checkout.submit} · ${totalText}`,
    onClick: () => formRef.current?.requestSubmit(),
    visible: loaded && !empty && !done,
    enabled: !cart.hasUnavailable,
    loading: submitting,
  });

  const requestPhone = () => {
    webApp?.requestContact((granted, response) => {
      if (granted && response?.status === "sent") {
        setValues((v) => ({ ...v, phone: formatPhoneInput(response.responseUnsafe.contact.phone_number) }));
        setErrors((prev) => ({ ...prev, phone: undefined }));
      }
    });
  };

  if (!loaded || done) {
    return (
      <div className="grid place-items-center py-24 text-ink-3">
        <LoaderCircle className="size-8 animate-spin" />
      </div>
    );
  }

  if (empty) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl font-bold">{t.checkout.emptyTitle}</p>
        <Link href="/products" className="mt-3 inline-block font-medium text-brand hover:underline">
          {t.checkout.backToCatalog}
        </Link>
      </div>
    );
  }

  const submitButton = (
    <button
      type="submit"
      form="checkout-form"
      disabled={submitting || cart.hasUnavailable}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-field)] bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover active:bg-brand-press disabled:cursor-not-allowed disabled:bg-page disabled:text-ink-3"
    >
      {submitting && <LoaderCircle className="size-5 animate-spin" />}
      {t.checkout.submit}
    </button>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-6">
      <form
        id="checkout-form"
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="space-y-4 rounded-[var(--radius-card)] bg-surface p-4 sm:p-6"
      >
        <h2 className="text-lg font-bold tracking-[-0.01em]">{t.checkout.recipient}</h2>

        <Field label={t.checkout.name} error={errors.name}>
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            value={values.name}
            onChange={set("name")}
            placeholder={t.checkout.namePlaceholder}
            aria-invalid={Boolean(errors.name)}
            className={inputClass(errors.name)}
          />
        </Field>

        <Field label={t.checkout.phone} error={errors.phone}>
          <div className="flex gap-2">
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={values.phone}
              onChange={set("phone")}
              placeholder="+998 90 123 45 67"
              aria-invalid={Boolean(errors.phone)}
              className={cn(inputClass(errors.phone), "flex-1 tabular")}
            />
            {webApp?.isVersionAtLeast("6.9") && (
              <button
                type="button"
                onClick={requestPhone}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-field)] border border-line-strong px-3 text-sm font-medium text-ink hover:border-ink-3"
              >
                <Send className="size-4 text-[#229ED9]" />
                {t.checkout.shareTelegram}
              </button>
            )}
          </div>
        </Field>

        <Field label={t.checkout.address} error={errors.address}>
          <textarea
            name="address"
            autoComplete="street-address"
            required
            minLength={5}
            rows={3}
            value={values.address}
            onChange={set("address")}
            placeholder={t.checkout.addressPlaceholder}
            aria-invalid={Boolean(errors.address)}
            className={cn(inputClass(errors.address), "h-auto resize-none py-3 leading-relaxed")}
          />
        </Field>

        <Field label={t.checkout.comment} hint={t.checkout.optional} error={errors.comment}>
          <input
            name="comment"
            value={values.comment}
            onChange={set("comment")}
            placeholder={t.checkout.commentPlaceholder}
            className={inputClass(errors.comment)}
          />
        </Field>

        <p className="flex items-start gap-2.5 rounded-[var(--radius-field)] bg-cream-soft p-3 text-[13px] leading-relaxed text-ink-2">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-3" />
          {t.checkout.note}
        </p>
      </form>

      <div className="space-y-4 lg:sticky lg:top-32">
        <OrderSummary cart={cart}>
          {!inTelegram && <div className="hidden lg:block">{submitButton}</div>}
        </OrderSummary>

        <div className="rounded-[var(--radius-card)] bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold">{t.checkout.yourOrder}</h3>
          <ul className="space-y-2.5">
            {cart.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 text-sm">
                <span className="shrink-0 overflow-hidden rounded-lg bg-cream">
                  <ProductImage src={item.image} alt="" className="aspect-[4/5] w-11" />
                </span>
                <span className="line-clamp-2 flex-1 text-ink-2">{keepUnits(localized(locale, item.name, item.nameRu))}</span>
                <span className="shrink-0 text-ink-3 tabular">× {item.quantity}</span>
              </li>
            ))}
          </ul>
          {cart.hasUnavailable && (
            <Link href="/cart" className="mt-3 block text-sm font-medium text-brand hover:underline">
              {t.cart.fixCart}
            </Link>
          )}
        </div>
      </div>

      {!inTelegram && (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface px-4 py-2.5 shadow-[var(--shadow-bar)] md:bottom-0 lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs text-ink-3">{t.summary.total}</p>
              <p className="text-lg font-bold leading-tight tabular">{totalText}</p>
            </div>
            <div className="flex-1">{submitButton}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function inputClass(error?: string) {
  return cn(
    "h-12 w-full rounded-[var(--radius-field)] border bg-surface px-3.5 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-ink-3 focus:ring-3",
    error ? "border-brand focus:ring-brand/15" : "border-line-strong focus:border-brand focus:ring-brand/15",
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label}
        {hint && <span className="font-normal text-ink-3"> · {hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-[13px] font-medium text-brand">{error}</span>}
    </label>
  );
}

