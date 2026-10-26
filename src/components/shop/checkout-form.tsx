"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, Phone, Send } from "lucide-react";
import { useMainButton } from "@/hooks/use-main-button";
import { cn } from "@/lib/cn";
import { formatPhoneInput, formatPrice } from "@/lib/format";
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
        if (data?.details) {
          const details = data.details as Record<string, string[] | undefined>;
          setErrors(Object.fromEntries(Object.entries(details).map(([key, messages]) => [key, messages?.[0]])));
        }
        haptic(webApp, "error");
        toast.error(data?.error ?? "Buyurtma yuborilmadi");
        if (response.status === 409) await refresh(); // qoldiq o'zgargan bo'lishi mumkin
        return;
      }

      try {
        const { name, phone, address } = values;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, phone, address }));
      } catch {}
      setDone(true);
      haptic(webApp, "success");
      router.replace(`/checkout/success?id=${data.orderId}`);
      void refresh();
    } catch {
      toast.error("Internet aloqasini tekshirib, qayta urinib ko'ring");
    } finally {
      setSubmitting(false);
    }
  };

  const empty = cart.items.length === 0;

  const inTelegram = useMainButton({
    text: `Buyurtmani tasdiqlash · ${formatPrice(cart.total)}`,
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
      <div className="grid place-items-center py-24 text-ink-faint">
        <LoaderCircle className="size-8 animate-spin" />
      </div>
    );
  }

  if (empty) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-2xl font-semibold">Savat bo&apos;sh</p>
        <Link href="/products" className="mt-4 inline-block font-bold text-berry-600">
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="space-y-4 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6"
      >
        <h2 className="text-lg font-bold">Qabul qiluvchi</h2>

        <Field label="Ismingiz" error={errors.name}>
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            value={values.name}
            onChange={set("name")}
            placeholder="Masalan: Dilnoza Karimova"
            className={inputClass(errors.name)}
          />
        </Field>

        <Field label="Telefon raqam" error={errors.phone}>
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
              className={cn(inputClass(errors.phone), "flex-1")}
            />
            {webApp?.isVersionAtLeast("6.9") && (
              <button
                type="button"
                onClick={requestPhone}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-sky-50 px-3 text-sm font-bold text-sky-700 ring-1 ring-sky-100"
              >
                <Send className="size-4" /> Telegram
              </button>
            )}
          </div>
        </Field>

        <Field label="Yetkazib berish manzili" error={errors.address}>
          <textarea
            name="address"
            autoComplete="street-address"
            required
            minLength={5}
            rows={3}
            value={values.address}
            onChange={set("address")}
            placeholder="Shahar, tuman, ko'cha, uy, xonadon. Mo'ljal: ..."
            className={cn(inputClass(errors.address), "h-auto py-3")}
          />
        </Field>

        <Field label="Izoh (ixtiyoriy)" error={errors.comment}>
          <input
            name="comment"
            value={values.comment}
            onChange={set("comment")}
            placeholder="Qo'ng'iroq qilish vaqti, qo'shimcha ma'lumot"
            className={inputClass(errors.comment)}
          />
        </Field>

        <p className="flex items-start gap-2 rounded-2xl bg-cream p-3 text-xs leading-relaxed text-ink-soft">
          <Phone className="mt-0.5 size-4 shrink-0 text-berry-600" />
          Buyurtmadan so&apos;ng operatorimiz qo&apos;ng&apos;iroq qilib, yetkazib berish vaqtini kelishib oladi. To&apos;lov —
          mahsulotni qabul qilganda, naqd yoki karta orqali.
        </p>

        {!inTelegram && (
          <button
            type="submit"
            disabled={submitting || cart.hasUnavailable}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-berry-600 text-[15px] font-bold text-white transition hover:bg-berry-700 disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-faint"
          >
            {submitting && <LoaderCircle className="size-5 animate-spin" />}
            Buyurtmani tasdiqlash · {formatPrice(cart.total)}
          </button>
        )}
      </form>

      <div className="space-y-4 lg:sticky lg:top-24">
        <OrderSummary cart={cart} />
        <ul className="space-y-2 rounded-3xl bg-white p-4 ring-1 ring-line">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3 text-sm">
              <ProductImage src={item.image} alt="" className="size-12 rounded-xl" />
              <span className="line-clamp-2 flex-1">{item.name}</span>
              <span className="shrink-0 font-semibold tabular-nums">× {item.quantity}</span>
            </li>
          ))}
        </ul>
        {cart.hasUnavailable && (
          <Link href="/cart" className="block text-center text-sm font-bold text-berry-600">
            Savatdagi muammolarni tuzatish →
          </Link>
        )}
      </div>
    </div>
  );
}

function inputClass(error?: string) {
  return cn(
    "h-12 w-full rounded-2xl border bg-cream/40 px-4 outline-none transition placeholder:text-ink-faint focus:bg-white focus:ring-4",
    error ? "border-berry-500 focus:ring-berry-100" : "border-line focus:border-berry-500 focus:ring-berry-100",
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-semibold text-berry-600">{error}</span>}
    </label>
  );
}
