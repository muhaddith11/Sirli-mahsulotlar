"use client";

import { useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

/** Telefonda filtrlar pastdan chiqadigan panelda ochiladi */
export function FilterSheet({ active, children }: { active: boolean; children: React.ReactNode }) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors lg:hidden",
          active ? "border-brand bg-brand-soft text-brand" : "border-line-strong bg-surface text-ink hover:border-ink-3",
        )}
      >
        <SlidersHorizontal className="size-4" />
        {t.catalog.price}
      </button>
      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-0 mt-auto w-full max-w-none rounded-t-2xl bg-surface p-0 text-ink backdrop:bg-ink/40 open:animate-[sheet-in_220ms_var(--ease-out)] lg:hidden"
      >
        <div className="pb-safe px-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-lg font-bold">{t.catalog.price}</span>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label={t.common.close}
              className="grid size-9 place-items-center rounded-full bg-page text-ink-2"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="pb-5">{children}</div>
        </div>
      </dialog>
    </>
  );
}
