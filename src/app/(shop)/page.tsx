import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageCircle, Truck, Wallet } from "lucide-react";
import { CategoryRail } from "@/components/shop/category-rail";
import { HeroBanner } from "@/components/shop/hero-banner";
import { ProductGrid } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/shop/section-heading";
import { listCategories, listProducts } from "@/lib/services/products";

export const dynamic = "force-dynamic";

const PERKS = [
  { icon: Truck, title: "Tez yetkazish", text: "Toshkent bo'ylab 1–2 kunda" },
  { icon: BadgeCheck, title: "Sifat kafolati", text: "Nuqsonli bo'lsa almashtiramiz" },
  { icon: Wallet, title: "Qabul qilganda to'lov", text: "Naqd yoki karta orqali" },
  { icon: MessageCircle, title: "Telegram orqali", text: "Buyurtma 1 daqiqada" },
];

export default async function HomePage() {
  const [categories, discounted, popular] = await Promise.all([
    listCategories(),
    listProducts({ discounted: true, limit: 4, sort: "popular" }),
    listProducts({ limit: 8, sort: "popular" }),
  ]);

  return (
    <div className="space-y-12 pb-4 sm:space-y-16">
      <div>
        <HeroBanner />
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-line">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-600">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight">{title}</span>
                <span className="block text-xs leading-snug text-ink-soft">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {categories.length > 0 && (
        <section>
          <SectionHeading title="Ommabop kategoriyalar" href="/products" linkLabel="Katalog" />
          <CategoryRail categories={categories} />
        </section>
      )}

      {discounted.items.length > 0 && (
        <section>
          <SectionHeading
            title="Chegirmadagi mahsulotlar"
            subtitle="Narxlar vaqtincha pasaytirilgan"
            href="/products?discounted=1"
          />
          <ProductGrid products={discounted.items} />
        </section>
      )}

      <section>
        <SectionHeading title="Ommabop mahsulotlar" subtitle="Mijozlarimiz eng ko'p tanlaganlari" href="/products" />
        {popular.items.length > 0 ? (
          <ProductGrid products={popular.items} />
        ) : (
          <p className="rounded-3xl bg-white p-8 text-center text-ink-soft ring-1 ring-line">
            Hozircha mahsulotlar qo&apos;shilmagan.
          </p>
        )}
      </section>

      <section className="grid items-center gap-6 overflow-hidden rounded-[2rem] bg-honey-100 p-6 sm:grid-cols-[1fr_auto] sm:p-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-berry-600">Sovg&apos;a uchun</p>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            15 donalik &quot;Qulupnay&quot; to&apos;plami
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            Kastryulkalar, choynak, kovsh va tog&apos;ora — hammasi bir xil naqshda. Kelin-kuyovlar va yangi uy egalari
            uchun eng yaxshi sovg&apos;a.
          </p>
          <Link
            href="/products/toplam-qulupnay-15"
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-bold text-cream transition hover:bg-berry-700"
          >
            Batafsil <ArrowRight className="size-4" />
          </Link>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/products/set-strawberry.svg"
          alt="Qulupnay naqshli emal to'plam"
          className="mx-auto w-full max-w-72 rounded-[1.5rem]"
          loading="lazy"
        />
      </section>
    </div>
  );
}
