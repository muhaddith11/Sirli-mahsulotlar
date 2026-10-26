"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { deleteCategoryAction, saveCategoryAction } from "@/actions/admin/categories";
import { INITIAL_ACTION_RESULT, type ActionResult } from "@/actions/admin/types";
import type { DishType } from "@/generated/prisma/enums";
import { DISH_TYPES, DISH_TYPE_LABELS } from "@/lib/constants";
import { adminInput, Field } from "./form-fields";

export type CategoryValues = {
  id: string;
  name: string;
  slug: string;
  dishType: DishType;
  volume: string | null;
  collectionName: string | null;
  description: string | null;
  image: string | null;
  sortOrder: number;
};

export function CategoryForm({ category, onDone }: { category?: CategoryValues; onDone?: () => void }) {
  const router = useRouter();
  const [state, setState] = useState<ActionResult>(INITIAL_ACTION_RESULT);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const errors = state.fieldErrors ?? {};

  const save = (data: FormData) =>
    startTransition(async () => {
      const result = await saveCategoryAction(INITIAL_ACTION_RESULT, data);
      setState(result);
      if (result.ok) {
        toast.success("Kategoriya saqlandi");
        router.refresh();
        onDone?.();
      }
    });

  const remove = () => {
    if (!category || !confirm(`"${category.name}" kategoriyasi o'chirilsinmi?`)) return;
    startDelete(async () => {
      const result = await deleteCategoryAction(category.id);
      if (result.ok) {
        toast.success("Kategoriya o'chirildi");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(new FormData(e.currentTarget));
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {category && <input type="hidden" name="id" value={category.id} />}
      <Field label="Nomi" error={errors.name}>
        <input name="name" required defaultValue={category?.name} placeholder="Kastryulkalar" className={adminInput} />
      </Field>
      <Field label="Idish turi" error={errors.dishType}>
        <select name="dishType" defaultValue={category?.dishType ?? "POT"} className={adminInput}>
          {DISH_TYPES.map((t) => (
            <option key={t} value={t}>
              {DISH_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Slug (URL)" hint="Bo'sh bo'lsa — nomidan" error={errors.slug}>
        <input name="slug" defaultValue={category?.slug} placeholder="kastryulkalar" className={adminInput} />
      </Field>
      <Field label="Hajmi" hint='Masalan: "2–16 L"' error={errors.volume}>
        <input name="volume" defaultValue={category?.volume ?? ""} className={adminInput} />
      </Field>
      <Field label="To'plam nomi" hint='Masalan: "Qulupnay"' error={errors.collectionName}>
        <input name="collectionName" defaultValue={category?.collectionName ?? ""} className={adminInput} />
      </Field>
      <Field label="Tartib raqami" hint="Kichigi oldinda" error={errors.sortOrder}>
        <input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className={adminInput} />
      </Field>
      <Field label="Rasm URL" className="sm:col-span-2" error={errors.image}>
        <input name="image" defaultValue={category?.image ?? ""} placeholder="/products/... yoki https://..." className={adminInput} />
      </Field>
      <Field label="Qisqa tavsif" className="sm:col-span-2 lg:col-span-1" error={errors.description}>
        <input name="description" defaultValue={category?.description ?? ""} className={adminInput} />
      </Field>

      <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-berry-600 px-5 text-sm font-bold text-white hover:bg-berry-700 disabled:opacity-60"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          Saqlash
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="h-10 rounded-full px-4 text-sm font-semibold text-ink-soft hover:bg-cream-deep">
            Bekor qilish
          </button>
        )}
        {category && (
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="ml-auto h-10 rounded-full px-4 text-sm font-semibold text-berry-600 hover:bg-berry-50 disabled:opacity-50"
          >
            O&apos;chirish
          </button>
        )}
        {state.error && <p className="w-full text-sm font-semibold text-berry-600">{state.error}</p>}
      </div>
    </form>
  );
}
