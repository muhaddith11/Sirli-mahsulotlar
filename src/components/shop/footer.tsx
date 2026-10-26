import Link from "next/link";
import { Clock, MapPin, Phone, Send } from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-cream-deep/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
            Emal kastryulkalar, choynaklar va oshxona idishlari. Sifatli, chiroyli va uzoq xizmat qiladi.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">Katalog</h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li><Link className="hover:text-berry-600" href="/products?category=kastryulkalar">Kastryulkalar</Link></li>
            <li><Link className="hover:text-berry-600" href="/products?category=toplamlar">To&apos;plamlar</Link></li>
            <li><Link className="hover:text-berry-600" href="/products?category=choynaklar">Choynaklar</Link></li>
            <li><Link className="hover:text-berry-600" href="/products?discounted=1">Chegirmalar</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">Bog&apos;lanish</h3>
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li className="flex items-center gap-2"><Phone className="size-4 text-berry-600" /> +998 90 000 00 00</li>
            <li className="flex items-center gap-2"><Send className="size-4 text-berry-600" /> Telegram orqali buyurtma</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-berry-600" /> Toshkent sh.</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">Ish vaqti</h3>
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Clock className="size-4 text-berry-600" /> Har kuni 09:00 – 20:00
          </p>
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} Sirli Mahsulotlar
      </p>
    </footer>
  );
}
