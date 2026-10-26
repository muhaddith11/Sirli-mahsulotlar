import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { PotMark } from "@/components/shop/logo";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin — kirish", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="grid min-h-dvh place-items-center bg-page px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)]-TMP bg-white p-8 shadow-[0_30px_60px_-30px_rgba(42,30,23,0.35)] ring-1 ring-line">
        <span className="grid size-14 place-items-center rounded-[var(--radius-card)] bg-brand text-white">
          <PotMark className="size-8" />
        </span>
        <h1 className="mt-5 tracking-[-0.02em] text-2xl font-semibold">Admin panel</h1>
        <p className="mt-1 text-sm text-ink-2">Sirli Mahsulotlar do&apos;konini boshqarish</p>
        <LoginForm />
      </div>
    </div>
  );
}
