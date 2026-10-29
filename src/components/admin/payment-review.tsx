"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, LoaderCircle, X } from "lucide-react";
import { setPaymentResultAction } from "@/actions/admin/payment";
import type { PaymentStatus } from "@/generated/prisma/enums";

/** Chekni tasdiqlash / rad etish — botdagi tugmalar bilan bir xil, mijozga xabar boradi */
export function PaymentReviewButtons({ orderId, status }: { orderId: string; status: PaymentStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const decide = (approve: boolean) => {
    const question = approve
      ? "To'lov tasdiqlansinmi? Mijozga «to'lovingiz tasdiqlandi» xabari boradi."
      : "Chek rad etilsinmi? Mijozdan chekni qayta yuborish so'raladi.";
    if (!confirm(question)) return;
    startTransition(async () => {
      const result = await setPaymentResultAction(orderId, approve);
      if (!result.ok) {
        toast.error(result.error ?? "Saqlanmadi");
        return;
      }
      toast.success(approve ? "To'lov tasdiqlandi" : "Chek rad etildi");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "PAID" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => decide(true)}
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-field)] bg-success px-4 text-sm font-semibold text-white hover:bg-success/90 disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
          Tasdiqlash
        </button>
      )}
      {status !== "REJECTED" && status !== "UNPAID" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => decide(false)}
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-field)] px-4 text-sm font-semibold text-brand ring-1 ring-brand/30 hover:bg-brand-soft disabled:opacity-60"
        >
          <X className="size-4" />
          Rad etish
        </button>
      )}
    </div>
  );
}
