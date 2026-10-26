"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/provider";

/** Do'kon sahifasida kutilmagan xato: qayta urinish yoki bosh sahifaga qaytish */
export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <h1 className="text-xl font-bold">{t.common.error}</h1>
      <p className="mt-2 text-sm text-ink-2">{t.errors.generic}</p>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-field)] bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-hover"
        >
          <RotateCcw className="size-4" />
          {t.errors.retry}
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-[var(--radius-field)] px-4 text-[15px] font-medium text-ink-2 hover:bg-surface"
        >
          {t.notFound.home}
        </Link>
      </div>
    </div>
  );
}
