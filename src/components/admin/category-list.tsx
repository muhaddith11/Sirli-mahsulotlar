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
        <div className="rounded-[var(--radius-card)] bg-white p-5 ring-2 ring-brand/30">
          <h2 className="mb-4 font-bold">Yangi kategoriya</h2>
          <CategoryForm onDone={() => setEditing(null)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-line py-4 text-sm font-bold text-ink-2 hover:border-brand/40 hover:text-brand"
        >
          <Plus className="size-4" /> Yangi kategoriya
        </button>
      )}

      {categories.map((category) =>
        editing === category.id ? (
          <div key={category.id} className="rounded-[var(--radius-card)] bg-white p-5 ring-2 ring-brand/30">
            <CategoryForm category={category} onDone={() => setEditing(null)} />
          </div>
        ) : (
          <div key={category.id} className="flex items-center gap-4 rounded-[var(--radius-card)] bg-white p-3 ring-1 ring-line">
            <ProductImage src={category.image} alt="" className="size-14 shrink-0 rounded-[var(--radius-field)]" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{category.name}</p>
              <p className="text-xs text-ink-3">
                {DISH_TYPE_LABELS[category.dishType]}
                {category.volume && ` · ${category.volume}`}
                {category.collectionName && ` · ${category.collectionName}`} · /{category.slug}
              </p>
            </div>
            <span className="hidden text-sm text-ink-2 sm:block">{category.productCount} ta mahsulot</span>
            <button
              type="button"
              onClick={() => setEditing(category.id)}
              className="grid size-9 place-items-center rounded-lg text-ink-2 ring-1 ring-line hover:bg-page hover:text-ink"
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
