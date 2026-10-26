"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { updateOrderStatusAction } from "@/actions/admin/orders";
import type { OrderStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/constants";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const locked = status === "CANCELLED";

  const change = (next: OrderStatus) => {
    if (next === value) return;
    if (next === "CANCELLED" && !confirm("Buyurtma bekor qilinsa, mahsulotlar omborga qaytariladi va qayta tiklab bo'lmaydi. Davom etasizmi?")) {
      return;
    }
    const previous = value;
    setValue(next);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next);
      if (result.ok) {
        toast.success(`Holat: ${ORDER_STATUS_LABELS[next]}`);
        router.refresh();
      } else {
        setValue(previous);
        toast.error(result.error ?? "Holat o'zgarmadi");
      }
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        disabled={locked || pending}
        onChange={(e) => change(e.target.value as OrderStatus)}
        aria-label="Buyurtma holati"
        className={cn(
          "h-9 w-full cursor-pointer appearance-none rounded-full py-0 pl-3 pr-8 text-xs font-bold ring-1 outline-none disabled:cursor-not-allowed",
          ORDER_STATUS_STYLES[value],
        )}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px]">
        {pending ? <LoaderCircle className="size-3.5 animate-spin" /> : "▼"}
      </span>
    </div>
  );
}
