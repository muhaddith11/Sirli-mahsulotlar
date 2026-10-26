"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { ProductImage } from "@/components/shop/product-image";
import { DISH_TYPE_LABELS } from "@/lib/constants";
import { CategoryForm, type CategoryValues } from "./category-form";

type Item = CategoryValues & { productCount: number };

export function CategoryList({ categories }: { categories: Item[] }) {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {editing === "new" ? (
        <div className="rounded-2xl bg-white p-5 ring-2 ring-berry-200">
          <h2 className="mb-4 font-bold">Yangi kategoriya</h2>
          <CategoryForm onDone={() => setEditing(null)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-4 text-sm font-bold text-ink-soft hover:border-berry-200 hover:text-berry-600"
        >
          <Plus className="size-4" /> Yangi kategoriya
        </button>
      )}

      {categories.map((category) =>
        editing === category.id ? (
          <div key={category.id} className="rounded-2xl bg-white p-5 ring-2 ring-berry-200">
            <CategoryForm category={category} onDone={() => setEditing(null)} />
          </div>
        ) : (
          <div key={category.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-line">
            <ProductImage src={category.image} alt="" className="size-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{category.name}</p>
              <p className="text-xs text-ink-faint">
                {DISH_TYPE_LABELS[category.dishType]}
                {category.volume && ` · ${category.volume}`}
                {category.collectionName && ` · ${category.collectionName}`} · /{category.slug}
              </p>
            </div>
            <span className="hidden text-sm text-ink-soft sm:block">{category.productCount} ta mahsulot</span>
            <button
              type="button"
              onClick={() => setEditing(category.id)}
              className="grid size-9 place-items-center rounded-lg text-ink-soft ring-1 ring-line hover:bg-cream-deep hover:text-ink"
              aria-label={`${category.name} — tahrirlash`}
            >
              <Pencil className="size-4" />
            </button>
          </div>
        ),
      )}
    </div>
  );
}
