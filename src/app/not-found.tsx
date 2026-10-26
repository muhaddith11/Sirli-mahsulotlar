import Link from "next/link";
import { PotMark } from "@/components/shop/logo";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <PotMark className="size-14 text-brand" />
      <p className="mt-4 text-5xl font-bold tracking-[-0.03em] tabular">404</p>
      <h1 className="mt-2 text-xl font-bold">{t.notFound.title}</h1>
      <p className="mt-1.5 text-sm text-ink-2">{t.notFound.text}</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-field)] bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-hover"
      >
        {t.notFound.home}
      </Link>
    </div>
  );
}
