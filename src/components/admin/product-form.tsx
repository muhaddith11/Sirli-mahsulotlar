"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { saveProductAction } from "@/actions/admin/products";
import { INITIAL_ACTION_RESULT } from "@/actions/admin/types";
import { adminInput, Field, Toggle } from "./form-fields";
import { ImageManager } from "./image-manager";

export type ProductFormValues = {
  id?: string;
  name: string;
  nameRu: string | null;
  slug: string;
  sku: string | null;
  categoryId: string;
  description: string;
  descriptionRu: string | null;
  price: number | null;
  discountPrice: number | null;
  stock: number;
  volume: string | null;
  pieces: number | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
};

type Props = {
  product?: ProductFormValues;
  categories: { id: string; name: string }[];
};

export function ProductForm({ product, categories }: Props) {
  const [state, formAction] = useActionState(saveProductAction, INITIAL_ACTION_RESULT);
  const [pending, startTransition] = useTransition();
  const errors = state.fieldErrors ?? {};

  return (
    <form
      // onSubmit orqali yuboramiz: React form'ni xatolik bo'lganda tozalab yubormaydi
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start"
    >
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-6">
        <section className="space-y-4 rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line">
          <h2 className="font-bold">Asosiy ma&apos;lumot</h2>
          <Field label="Nomi" error={errors.name}>
            <input
              name="name"
              required
              defaultValue={product?.name}
              placeholder='Masalan: Emal kastryulka "Qulupnay" 16 L'
              className={adminInput}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug (URL)" hint="Bo'sh qoldirsangiz, nomidan yasaladi" error={errors.slug}>
              <input name="slug" defaultValue={product?.slug} placeholder="kastryulka-qulupnay-16l" className={adminInput} />
            </Field>
            <Field label="Artikul (SKU)" error={errors.sku}>
              <input name="sku" defaultValue={product?.sku ?? ""} placeholder="KS-QLP-16" className={adminInput} />
            </Field>
          </div>
          <Field label="Nomi (ruscha)" hint="Bo'sh qolsa, rus tilida ham o'zbekcha nomi ko'rinadi" error={errors.nameRu}>
            <input
              name="nameRu"
              defaultValue={product?.nameRu ?? ""}
              placeholder="Эмалированная кастрюля «Клубника» 16 л"
              className={adminInput}
            />
          </Field>
          <Field label="Tavsif" error={errors.description}>
            <textarea
              name="description"
              rows={7}
              defaultValue={product?.description}
              placeholder="Material, o'lchamlar, qaysi plitaga mosligi…"
              className={`${adminInput} h-auto py-3 leading-relaxed`}
            />
          </Field>
          <Field label="Tavsif (ruscha)" hint="Ixtiyoriy" error={errors.descriptionRu}>
            <textarea
              name="descriptionRu"
              rows={5}
              defaultValue={product?.descriptionRu ?? ""}
              className={`${adminInput} h-auto py-3 leading-relaxed`}
            />
          </Field>
        </section>

        <section className="rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line">
          <h2 className="mb-1 font-bold">Rasmlar</h2>
          <p className="mb-4 text-xs text-ink-3">Birinchi rasm katalogda ko&apos;rinadi. JPG/PNG/WEBP, 5 MB gacha.</p>
          <ImageManager initial={product?.images ?? []} error={errors.images} />
        </section>
      </div>

      <div className="space-y-6 lg:sticky lg:top-8">
        <section className="space-y-4 rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line">
          <h2 className="font-bold">Narx va ombor</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Narxi (so'm)" error={errors.price}>
              <input
                name="price"
                type="number"
                min={1}
                step={1}
                required
                inputMode="numeric"
                defaultValue={product?.price ?? ""}
                className={adminInput}
              />
            </Field>
            <Field label="Chegirma narxi" hint="Ixtiyoriy" error={errors.discountPrice}>
              <input
                name="discountPrice"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                defaultValue={product?.discountPrice ?? ""}
                className={adminInput}
              />
            </Field>
            <Field label="Qoldiq (dona)" error={errors.stock}>
              <input
                name="stock"
                type="number"
                min={0}
                step={1}
                required
                inputMode="numeric"
                defaultValue={product?.stock ?? 0}
                className={adminInput}
              />
            </Field>
            <Field label="Hajmi" hint='Masalan: "16 L"' error={errors.volume}>
              <input name="volume" defaultValue={product?.volume ?? ""} className={adminInput} />
            </Field>
          </div>
          <Field label="To'plamdagi buyumlar soni" hint="Faqat to'plamlar uchun" error={errors.pieces}>
            <input
              name="pieces"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              defaultValue={product?.pieces ?? ""}
              className={adminInput}
            />
          </Field>
        </section>

        <section className="space-y-3 rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line">
          <Field label="Kategoriya" error={errors.categoryId}>
            <select name="categoryId" required defaultValue={product?.categoryId ?? ""} className={adminInput}>
              <option value="" disabled>
                Tanlang…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Toggle name="isActive" label="Sotuvda" hint="O'chirilsa, do'konda ko'rinmaydi" defaultChecked={product?.isActive ?? true} />
          <Toggle name="isFeatured" label="Tavsiya etilgan" hint="Bosh sahifada birinchi ko'rsatiladi" defaultChecked={product?.isFeatured} />
        </section>

        {state.error && (
          <p className="rounded-[var(--radius-field)] bg-brand-soft p-3 text-sm font-semibold text-brand">{state.error}</p>
        )}

        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="flex h-12 flex-1 items-center justify-center rounded-[var(--radius-field)] bg-surface text-sm font-bold ring-1 ring-line hover:bg-page"
          >
            Bekor qilish
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-[var(--radius-field)] bg-brand text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
          >
            {pending && <LoaderCircle className="size-4 animate-spin" />}
            {product?.id ? "Saqlash" : "Mahsulotni qo'shish"}
          </button>
        </div>
      </div>
    </form>
  );
}
