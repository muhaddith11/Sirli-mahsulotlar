"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { formatCardNumber } from "@/lib/format";
import { haptic, useTelegram } from "@/providers/telegram-provider";

/** Kartaga o'tkazma rekvizitlari (do'kon sozlamalaridan) */
export type CheckoutPayment = { cardNumber: string | null; cardHolder: string | null; qr: string | null };

/** Clipboard API eski WebView'larda bo'lmasligi mumkin — textarea orqali zaxira yo'l */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/**
 * Kartaga o'tkazma bloki: summa, karta raqami (nusxa olish bilan), egasi va QR kodi.
 * Checkout'da va buyurtma qabul qilingan sahifada ishlatiladi; ostiga ko'rsatma (children) qo'yiladi.
 */
export function PaymentDetails({
  payment,
  amount,
  deliveryExtra = false,
  children,
}: {
  payment: CheckoutPayment;
  amount: string;
  deliveryExtra?: boolean;
  children?: React.ReactNode;
}) {
  const { t } = useI18n();
  const { webApp } = useTelegram();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!payment.cardNumber || !(await copyText(payment.cardNumber))) return;
    haptic(webApp, "light");
    toast.success(t.payment.copied);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="@container rounded-[var(--radius-field)] bg-cream-soft p-3.5 text-left sm:p-4">
      {/* Tor joyda (telefon, Mini App) QR pastga tushadi — karta raqami bir qatorda qoladi */}
      <div className="flex flex-col gap-4 @md:flex-row @md:items-start">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs text-ink-3">{t.payment.amount}</p>
            <p className="text-xl font-bold leading-tight tabular">{amount}</p>
            {deliveryExtra && <p className="mt-0.5 text-xs text-ink-2">{t.payment.deliveryExtra}</p>}
          </div>
          {payment.cardNumber && (
            <div>
              <p className="text-xs text-ink-3">{t.payment.cardNumber}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="whitespace-nowrap text-lg font-semibold tracking-wide tabular">
                  {formatCardNumber(payment.cardNumber)}
                </span>
                <button
                  type="button"
                  onClick={copy}
                  aria-label={t.payment.copy}
                  title={t.payment.copy}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-ink-2 ring-1 ring-line transition-colors hover:text-brand"
                >
                  {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                </button>
              </div>
              {payment.cardHolder && <p className="mt-0.5 text-sm text-ink-2">{payment.cardHolder}</p>}
            </div>
          )}
        </div>
        {payment.qr && (
          <figure className="mx-auto w-44 shrink-0 text-center @md:mx-0 @md:w-32">
            <img src={payment.qr} alt={t.payment.qrAlt} className="aspect-square w-full rounded-lg bg-white object-contain p-1.5 ring-1 ring-line" />
            <figcaption className="mt-1 text-[11px] leading-tight text-ink-3">{t.payment.qrHint}</figcaption>
          </figure>
        )}
      </div>
      {children && <div className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-ink-2">{children}</div>}
    </div>
  );
}
