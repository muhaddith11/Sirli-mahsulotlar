"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Clock, Info, LoaderCircle, MapPin, Send, Store, Truck, X } from "lucide-react";
import { fill, localized } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useMainButton } from "@/hooks/use-main-button";
import { cn } from "@/lib/cn";
import { deliveryFeeFor } from "@/lib/delivery-fee";
import { formatPhoneInput, formatPrice, keepUnits } from "@/lib/format";
import { rememberOrder } from "@/lib/order-history";
import { promoDiscountFor, type PromoTerms } from "@/lib/promo-discount";
import { useCart } from "@/providers/cart-provider";
import { haptic, useTelegram } from "@/providers/telegram-provider";
import { checkoutTotal, OrderSummary } from "./order-summary";
import { ProductImage } from "./product-image";

type Method = "DELIVERY" | "PICKUP";
type Values = { name: string; phone: string; address: string; comment: string; zoneId: string; deliveryMethod: Method };
type Errors = Partial<Record<keyof Values | "promoCode", string>>;

export type CheckoutZone = { id: string; name: string; nameRu: string | null; price: number | null; freeFrom: number | null };
export type CheckoutStore = {
  pickupAddress: string | null;
  pickupAddressRu: string | null;
  workingHours: string | null;
  workingHoursRu: string | null;
};

const STORAGE_KEY = "sirli:checkout-contact";

const EMPTY_VALUES: Values = { name: "", phone: "+998 ", address: "", comment: "", zoneId: "", deliveryMethod: "DELIVERY" };

/** Avvalgi buyurtmadagi kontaktlar (forma faqat klientda, savat yuklangach chiziladi) */
function readSavedValues(zones: CheckoutZone[]): Values {
  if (typeof window === "undefined") return EMPTY_VALUES;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Values> | null;
    if (!saved) return EMPTY_VALUES;
    return {
      ...EMPTY_VALUES,
      ...saved,
      comment: "",
      zoneId: saved.zoneId && zones.some((z) => z.id === saved.zoneId) ? saved.zoneId : "",
    };
  } catch {
    return EMPTY_VALUES; // localStorage mavjud bo'lmasligi mumkin (masalan, maxfiy rejim)
  }
}

export function CheckoutForm({ zones, store }: { zones: CheckoutZone[]; store: CheckoutStore }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { t, locale } = useI18n();
  const { cart, loaded, refresh } = useCart();
  const { webApp, user, initData } = useTelegram();
  const [values, setValues] = useState<Values>(() => readSavedValues(zones));
  const [nameTouched, setNameTouched] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<(PromoTerms & { code: string }) | null>(null);
  const [promoPending, setPromoPending] = useState(false);

  // Ism bo'sh bo'lsa — Telegram profilidagi ism (mijoz o'zi yozmaguncha)
  const telegramName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") : "";
  const nameValue = values.name || nameTouched ? values.name : telegramName;

  const set = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = field === "phone" ? formatPhoneInput(e.target.value) : e.target.value;
    if (field === "name") setNameTouched(true);
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const checkPromo = async (code: string) => {
    setPromoPending(true);
    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setPromo(null);
        setErrors((prev) => ({ ...prev, promoCode: data?.error ?? t.errors.generic }));
        return;
      }
      setPromo({ code: data.code, type: data.type, value: data.value, minOrder: data.minOrder });
      setErrors((prev) => ({ ...prev, promoCode: undefined }));
    } catch {
      toast.error(t.checkout.networkError);
    } finally {
      setPromoPending(false);
    }
  };

  const pickup = values.deliveryMethod === "PICKUP";
  const zone = zones.find((z) => z.id === values.zoneId) ?? null;
  // Savat o'zgarsa chegirma shu formula bilan qayta hisoblanadi (serverdagi bilan bir xil)
  const promoDiscount = promo ? promoDiscountFor(promo, cart.total) : 0;
  const promoBelowMinimum = Boolean(promo?.minOrder != null && cart.total < promo.minOrder);
  const fee = pickup ? 0 : deliveryFeeFor(zone, cart.total - promoDiscount);
  const total = checkoutTotal(cart, promoDiscount, fee);
  const totalText = formatPrice(total, locale);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrors({});
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          name: nameValue,
          address: pickup ? "" : values.address,
          zoneId: pickup ? undefined : values.zoneId || undefined,
          promoCode: promoBelowMinimum ? undefined : promo?.code,
          initData: initData || undefined,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.details) setErrors(data.details as Errors);
        haptic(webApp, "error");
        toast.error(data?.error ?? t.checkout.failed);
        if (response.status === 409) await refresh(); // qoldiq yoki promokod o'zgargan bo'lishi mumkin
        return;
      }

      try {
        const { phone, address, zoneId, deliveryMethod } = values;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: nameValue, phone, address, zoneId, deliveryMethod }));
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

  const pickupAddress = localized(locale, store.pickupAddress ?? "", store.pickupAddressRu);
  const hours = localized(locale, store.workingHours ?? "", store.workingHoursRu);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-6">
      <form
        id="checkout-form"
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="space-y-4"
      >
        <section className="space-y-4 rounded-[var(--radius-card)] bg-surface p-4 sm:p-6">
          <h2 className="text-lg font-bold tracking-[-0.01em]">{t.checkout.recipient}</h2>

          <Field label={t.checkout.name} error={errors.name}>
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              value={nameValue}
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
        </section>

        <section className="space-y-4 rounded-[var(--radius-card)] bg-surface p-4 sm:p-6">
          <h2 className="text-lg font-bold tracking-[-0.01em]">{t.checkout.method}</h2>

          <div role="radiogroup" aria-label={t.checkout.method} className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "DELIVERY", label: t.checkout.delivery, icon: Truck },
                { value: "PICKUP", label: t.checkout.pickup, icon: Store },
              ] as const
            ).map(({ value, label, icon: Icon }) => {
              const active = values.deliveryMethod === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setValues((v) => ({ ...v, deliveryMethod: value }))}
                  className={cn(
                    "flex min-h-14 items-center gap-2.5 rounded-[var(--radius-field)] border px-3 text-left text-sm font-medium transition-colors",
                    active ? "border-brand bg-brand-soft text-ink" : "border-line-strong text-ink-2 hover:border-ink-3",
                  )}
                >
                  <Icon className={cn("size-5 shrink-0", active ? "text-brand" : "text-ink-3")} strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </div>

          {pickup ? (
            <div className="space-y-2 rounded-[var(--radius-field)] bg-cream-soft p-3.5 text-sm">
              <p className="font-medium">{t.checkout.pickupTitle}</p>
              {pickupAddress ? (
                <>
                  <p className="flex items-start gap-2 text-ink-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" />
                    {pickupAddress}
                  </p>
                  {hours && (
                    <p className="flex items-start gap-2 text-ink-2">
                      <Clock className="mt-0.5 size-4 shrink-0 text-ink-3" />
                      {t.checkout.hours}: {hours}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-ink-2">{t.checkout.pickupUnknown}</p>
              )}
            </div>
          ) : (
            <>
              {zones.length > 0 && (
                <Field label={t.checkout.region} error={errors.zoneId}>
                  <select
                    name="zoneId"
                    required
                    value={values.zoneId}
                    onChange={set("zoneId")}
                    aria-invalid={Boolean(errors.zoneId)}
                    className={cn(inputClass(errors.zoneId), !values.zoneId && "text-ink-3")}
                  >
                    <option value="" disabled>
                      {t.checkout.regionPlaceholder}
                    </option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id} className="text-ink">
                        {localized(locale, z.name, z.nameRu)}
                        {z.price != null ? ` — ${z.price === 0 ? t.summary.deliveryFree : formatPrice(z.price, locale)}` : ""}
                      </option>
                    ))}
                  </select>
                  {zone?.freeFrom != null && zone.price != null && zone.price > 0 && (
                    <span className="mt-1.5 block text-[13px] text-success">
                      {fill(t.checkout.freeFrom, { amount: formatPrice(zone.freeFrom, locale) })}
                    </span>
                  )}
                </Field>
              )}

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
            </>
          )}
        </section>

        <section className="space-y-4 rounded-[var(--radius-card)] bg-surface p-4 sm:p-6">
          <Field label={t.checkout.comment} hint={t.checkout.optional} error={errors.comment}>
            <input
              name="comment"
              value={values.comment}
              onChange={set("comment")}
              placeholder={t.checkout.commentPlaceholder}
              className={inputClass(errors.comment)}
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium">
              {t.checkout.promo} <span className="font-normal text-ink-3">· {t.checkout.optional}</span>
            </span>
            {promo ? (
              <div className="flex h-12 items-center justify-between rounded-[var(--radius-field)] border border-success/40 bg-success-soft px-3.5">
                <span className="flex items-center gap-2 text-sm font-medium text-success">
                  <Check className="size-4" />
                  {fill(t.checkout.promoApplied, { code: promo.code })} · −{formatPrice(promoDiscount, locale)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPromo(null);
                    setPromoInput("");
                  }}
                  aria-label={t.checkout.promoRemove}
                  className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-white/60 hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    if (errors.promoCode) setErrors((prev) => ({ ...prev, promoCode: undefined }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (promoInput.trim()) void checkPromo(promoInput);
                    }
                  }}
                  placeholder={t.checkout.promoPlaceholder}
                  aria-label={t.checkout.promo}
                  aria-invalid={Boolean(errors.promoCode)}
                  autoCapitalize="characters"
                  className={cn(inputClass(errors.promoCode), "flex-1")}
                />
                <button
                  type="button"
                  disabled={!promoInput.trim() || promoPending}
                  onClick={() => checkPromo(promoInput)}
                  className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[var(--radius-field)] bg-ink px-4 text-sm font-semibold text-white hover:bg-ink/85 disabled:bg-page disabled:text-ink-3"
                >
                  {promoPending && <LoaderCircle className="size-4 animate-spin" />}
                  {t.checkout.promoApply}
                </button>
              </div>
            )}
            {promo && promoBelowMinimum && (
              <span className="mt-1.5 block text-[13px] font-medium text-brand">
                {fill(t.errors.promoMinOrder, { amount: formatPrice(promo.minOrder ?? 0, locale) })}
              </span>
            )}
            {errors.promoCode && <span className="mt-1.5 block text-[13px] font-medium text-brand">{errors.promoCode}</span>}
          </div>

          <p className="flex items-start gap-2.5 rounded-[var(--radius-field)] bg-cream-soft p-3 text-[13px] leading-relaxed text-ink-2">
            <Info className="mt-0.5 size-4 shrink-0 text-ink-3" />
            {t.checkout.note}
          </p>
        </section>
      </form>

      <div className="space-y-4 lg:sticky lg:top-32">
        <OrderSummary
          cart={cart}
          promo={promo && promoDiscount > 0 ? { code: promo.code, discount: promoDiscount } : null}
          delivery={{ method: values.deliveryMethod, fee }}
        >
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
