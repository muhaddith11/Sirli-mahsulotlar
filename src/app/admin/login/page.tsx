import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { PotMark } from "@/components/shop/logo";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin — kirish", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="grid min-h-dvh place-items-center bg-cream-deep px-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-[0_30px_60px_-30px_rgba(42,30,23,0.35)] ring-1 ring-line">
        <span className="grid size-14 place-items-center rounded-2xl bg-berry-600 text-cream">
          <PotMark className="size-8" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold">Admin panel</h1>
        <p className="mt-1 text-sm text-ink-soft">Sirli Mahsulotlar do&apos;konini boshqarish</p>
        <LoginForm />
      </div>
    </div>
  );
}
