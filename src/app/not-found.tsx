import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-semibold text-berry-600">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">Sahifa topilmadi</h1>
      <p className="mt-2 text-sm text-ink-soft">Bu sahifa o&apos;chirilgan yoki manzil noto&apos;g&apos;ri yozilgan.</p>
      <Link href="/" className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream hover:bg-berry-700">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
