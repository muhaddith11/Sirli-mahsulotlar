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
  slug: string;
  sku: string | null;
  categoryId: string;
  description: string;
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
        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-line">
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
          <Field label="Tavsif" error={errors.description}>
            <textarea
              name="description"
              rows={7}
              defaultValue={product?.description}
              placeholder="Material, o'lchamlar, qaysi plitaga mosligi…"
              className={`${adminInput} h-auto py-3 leading-relaxed`}
            />
          </Field>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <h2 className="mb-1 font-bold">Rasmlar</h2>
          <p className="mb-4 text-xs text-ink-faint">Birinchi rasm katalogda ko&apos;rinadi. JPG/PNG/WEBP, 5 MB gacha.</p>
          <ImageManager initial={product?.images ?? []} error={errors.images} />
        </section>
      </div>

      <div className="space-y-6 lg:sticky lg:top-8">
        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-line">
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

        <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-line">
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
          <p className="rounded-xl bg-berry-50 p-3 text-sm font-semibold text-berry-700">{state.error}</p>
        )}

        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-white text-sm font-bold ring-1 ring-line hover:bg-cream-deep"
          >
            Bekor qilish
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-full bg-berry-600 text-sm font-bold text-white hover:bg-berry-700 disabled:opacity-60"
          >
            {pending && <LoaderCircle className="size-4 animate-spin" />}
            {product?.id ? "Saqlash" : "Mahsulotni qo'shish"}
          </button>
        </div>
      </div>
    </form>
  );
}
