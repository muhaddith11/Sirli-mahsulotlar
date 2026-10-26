"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { deleteZoneAction, saveStoreSettingsAction, saveZoneAction } from "@/actions/admin/delivery";
import { INITIAL_ACTION_RESULT } from "@/actions/admin/types";
import { cn } from "@/lib/cn";
import { adminInput, Field } from "./form-fields";

export type ZoneRow = {
  id: string;
  name: string;
  nameRu: string | null;
  price: number | null;
  freeFrom: number | null;
  isActive: boolean;
  orderCount: number;
};

export type SettingsValues = {
  phone: string | null;
  pickupAddress: string | null;
  pickupAddressRu: string | null;
  workingHours: string | null;
  workingHoursRu: string | null;
};

export function StoreSettingsForm({ settings }: { settings: SettingsValues }) {
  const [state, formAction, pending] = useActionState(saveStoreSettingsAction, INITIAL_ACTION_RESULT);

  useEffect(() => {
    if (state.ok) toast.success("Sozlamalar saqlandi");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Telefon" hint="Footer'da ko'rinadi" error={state.fieldErrors?.phone}>
        <input name="phone" defaultValue={settings.phone ?? ""} placeholder="+998 90 123 45 67" className={adminInput} />
      </Field>
      <div className="hidden sm:block" />
      <Field label="Do'kon manzili (olib ketish uchun)">
        <input name="pickupAddress" defaultValue={settings.pickupAddress ?? ""} placeholder="Toshkent sh., ..." className={adminInput} />
      </Field>
      <Field label="Do'kon manzili (ruscha)">
        <input name="pickupAddressRu" defaultValue={settings.pickupAddressRu ?? ""} placeholder="г. Ташкент, ..." className={adminInput} />
      </Field>
      <Field label="Ish vaqti">
        <input name="workingHours" defaultValue={settings.workingHours ?? ""} placeholder="Har kuni 09:00–19:00" className={adminInput} />
      </Field>
      <Field label="Ish vaqti (ruscha)">
        <input name="workingHoursRu" defaultValue={settings.workingHoursRu ?? ""} placeholder="Ежедневно 09:00–19:00" className={adminInput} />
      </Field>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-field)] bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          Saqlash
        </button>
      </div>
    </form>
  );
}

const cell = "h-10 w-full rounded-[var(--radius-field)] border border-line-strong bg-surface px-2.5 text-sm outline-none focus:border-brand";

function ZoneEditorRow({ zone, onSaved }: { zone?: ZoneRow; onSaved?: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState({
    name: zone?.name ?? "",
    nameRu: zone?.nameRu ?? "",
    price: zone?.price != null ? String(zone.price) : "",
    freeFrom: zone?.freeFrom != null ? String(zone.freeFrom) : "",
    isActive: zone?.isActive ?? true,
  });
  const initial = JSON.stringify({
    name: zone?.name ?? "",
    nameRu: zone?.nameRu ?? "",
    price: zone?.price != null ? String(zone.price) : "",
    freeFrom: zone?.freeFrom != null ? String(zone.freeFrom) : "",
    isActive: zone?.isActive ?? true,
  });
  const dirty = JSON.stringify(values) !== initial;

  const save = () =>
    startTransition(async () => {
      const result = await saveZoneAction({ id: zone?.id, ...values });
      if (!result.ok) {
        toast.error(result.error ?? "Saqlanmadi");
        return;
      }
      toast.success(zone ? "Hudud saqlandi" : "Hudud qo'shildi");
      onSaved?.();
      router.refresh();
    });

  const remove = () => {
    if (!zone) return;
    if (!confirm(`"${zone.name}" o'chirilsinmi? Eski buyurtmalarda nomi saqlanib qoladi.`)) return;
    startTransition(async () => {
      await deleteZoneAction(zone.id);
      toast.success("Hudud o'chirildi");
      router.refresh();
    });
  };

  const numeric = (key: "price" | "freeFrom") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value.replace(/\D/g, "") }));

  return (
    <tr className={cn(!values.isActive && "opacity-60")}>
      <td className="px-3 py-2">
        <input value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} className={cell} aria-label="Nomi" />
      </td>
      <td className="px-3 py-2">
        <input value={values.nameRu} onChange={(e) => setValues((v) => ({ ...v, nameRu: e.target.value }))} className={cell} aria-label="Ruscha nomi" />
      </td>
      <td className="px-3 py-2">
        <input value={values.price} onChange={numeric("price")} inputMode="numeric" placeholder="operator" className={cn(cell, "text-right tabular")} aria-label="Narx" />
      </td>
      <td className="px-3 py-2">
        <input value={values.freeFrom} onChange={numeric("freeFrom")} inputMode="numeric" placeholder="—" className={cn(cell, "text-right tabular")} aria-label="Bepul chegarasi" />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
          className="size-5 cursor-pointer accent-[var(--color-brand)]"
          aria-label="Faol"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={save}
            disabled={pending || (!dirty && Boolean(zone))}
            className="grid size-9 place-items-center rounded-[var(--radius-field)] bg-ink text-white hover:bg-ink/85 disabled:bg-page disabled:text-ink-3"
            aria-label="Saqlash"
            title="Saqlash"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : zone ? <Check className="size-4" /> : <Plus className="size-4" />}
          </button>
          {zone && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="grid size-9 place-items-center rounded-[var(--radius-field)] text-ink-2 ring-1 ring-line hover:bg-brand-soft hover:text-brand"
              aria-label="O'chirish"
              title="O'chirish"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function ZonesTable({ zones }: { zones: ZoneRow[] }) {
  const [adding, setAdding] = useState(0);

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] bg-surface ring-1 ring-line">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold text-ink-3">
            <th className="px-3 py-3">Hudud</th>
            <th className="px-3 py-3">Ruscha</th>
            <th className="w-36 px-3 py-3 text-right">Narx, so&apos;m</th>
            <th className="w-36 px-3 py-3 text-right">Bepul, so&apos;mdan</th>
            <th className="w-16 px-3 py-3 text-center">Faol</th>
            <th className="w-28 px-3 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {zones.map((zone) => (
            <ZoneEditorRow key={`${zone.id}-${zone.price}-${zone.freeFrom}-${zone.isActive}-${zone.name}`} zone={zone} />
          ))}
          <ZoneEditorRow key={`new-${adding}`} onSaved={() => setAdding((n) => n + 1)} />
        </tbody>
      </table>
    </div>
  );
}
