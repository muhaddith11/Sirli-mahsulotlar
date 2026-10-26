"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deleteProductAction, toggleProductActiveAction } from "@/actions/admin/products";

const iconButton =
  "grid size-9 place-items-center rounded-lg text-ink-soft ring-1 ring-line transition hover:bg-cream-deep hover:text-ink disabled:opacity-40";

export function ProductRowActions({ id, name, isActive }: { id: string; name: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(result.error ?? "Xatolik");
      }
    });

  return (
    <div className="flex items-center gap-1.5">
      <Link href={`/admin/products/${id}`} className={iconButton} aria-label="Tahrirlash" title="Tahrirlash">
        <Pencil className="size-4" />
      </Link>
      <button
        type="button"
        className={iconButton}
        disabled={pending}
        onClick={() => run(() => toggleProductActiveAction(id), isActive ? "Mahsulot yashirildi" : "Mahsulot sotuvga chiqarildi")}
        aria-label={isActive ? "Yashirish" : "Sotuvga chiqarish"}
        title={isActive ? "Do'kondan yashirish" : "Sotuvga chiqarish"}
      >
        {isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
      <button
        type="button"
        className={`${iconButton} hover:!bg-berry-50 hover:!text-berry-700`}
        disabled={pending}
        onClick={() => {
          if (confirm(`"${name}" butunlay o'chirilsinmi? Buyurtmalar tarixida nomi saqlanib qoladi.`)) {
            run(() => deleteProductAction(id), "Mahsulot o'chirildi");
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
