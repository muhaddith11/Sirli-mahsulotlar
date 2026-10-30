"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { setShowcaseAction } from "@/actions/admin/products";
import { cn } from "@/lib/cn";

export function ShowcaseToggle({ id, inShowcase, full = false }: { id: string; inShowcase: boolean; full?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      const result = await setShowcaseAction(id, !inShowcase);
      if (result.ok) {
        toast.success(inShowcase ? "Vitrinadan olib tashlandi" : "Vitrinaga qo'yildi");
        router.refresh();
      } else {
        toast.error(result.error ?? "Xatolik");
      }
    });

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending || full}
      className={cn(
        "flex h-10 w-32 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-field)] text-sm font-semibold transition disabled:opacity-50 lg:w-36",
        inShowcase ? "text-ink-2 ring-1 ring-line hover:bg-page hover:text-ink" : "bg-brand text-white hover:bg-brand-hover",
      )}
    >
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {inShowcase ? "Olib tashlash" : "Vitrinaga qo'yish"}
    </button>
  );
}
