# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Xaridorlar (asosiy):** O'zbekistondagi oilalar uchun oshxona idishi tanlayotgan odamlar — o'zi uchun yoki sovg'aga (to'y, yangi uy, bayram). Ular do'konni Telegram (kanal va bot), Instagram (post va reels) yoki jismoniy do'kon va tanishlar orqali topadi. Ko'pchilik telefonda, ko'pincha Telegram ichidagi Mini App'dan ko'radi.
- **Do'kon egasi:** buyurtmalarni qabul qiladi, holatini yuritadi, mahsulot va ombor qoldig'ini boshqaradi. Buyurtma xabarlarini Telegram'da oladi.

## Product Purpose

Emal kastryulkalar, choynaklar, tog'oralar, krujkalar va to'plamlarni onlayn sotish: mijoz katalogni ko'rib, savatga yig'ib, bir necha bosishda buyurtma beradi; buyurtma darhol do'kon egasining Telegram'iga boradi. Muvaffaqiyat — Telegram/Instagram'dan kelgan odam operator bilan yozishmasdan o'zi buyurtma bera olishi.

## Positioning

Bitta ilova ham sayt, ham Telegram Mini App bo'lib ishlaydi: mijoz Telegram'dan chiqmasdan buyurtma beradi, egasi esa uni Telegram'da oladi. Jismoniy do'kon ham bor — mijoz kelib ko'rishi yoki olib ketishi mumkin.

## Operating Context

- Yetkazib berish butun O'zbekiston bo'ylab; jismoniy do'kondan olib ketish ham mumkin.
- To'lov hozircha qabul qilganda (naqd yoki karta); operator buyurtmadan keyin qo'ng'iroq qilib kelishadi.
- Narxlar so'mda.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router), Tailwind CSS 4, Prisma 7 + PostgreSQL (Neon), Vercel, Telegram Bot API (Telegraf), `@twa-dev/sdk`.
- Mini App ichida Telegram'ning MainButton va BackButton tugmalari ishlatiladi.
- Tillar: o'zbekcha (lotin) asosiy, **ruscha ham kerak**.
- Ochiq qarorlar: do'kon manzili, telefon raqami, ish vaqti, yetkazib berish narxlari va muddatlari hali berilmagan.

## Brand Commitments

- Nomi: **Sirli Mahsulotlar** ("sir" — emal/sir qoplamasi).
- **Ranglar: qizil va krem saqlanadi** (egasi tasdiqlagan). Shrift, kompozitsiya va komponentlar yangilanishi mumkin.
- **Telefondagi pastki navigatsiya saqlanadi.**
- Bosh sahifada birinchi navbatda **kategoriyalar** turadi.
- **Uslub: tanish marketpleys tartibi** — egasi uchta yo'nalishni ko'rib, shuni tanladi. Sifat mo'ljali — **Uzum Market** (mijozlar unga o'rganib qolgan). Bezak yoki "qiziq" g'oya qo'shilmaydi; farq puxta bajarilishda.
- Tayyor logo yo'q.

## Evidence on Hand

- Haqiqiy mahsulot rasmlari hozircha yo'q; `public/products/*.svg` — vaqtinchalik chizilgan demo rasmlar.
- Mijoz sharhlari, sotuv raqamlari, kafolat va qaytarish shartlari tasdiqlanmagan — ularni o'ylab topmaslik kerak.

## Product Principles

1. Telefonda va Telegram ichida birinchi navbatda yaxshi ishlashi kerak.
2. Buyurtma berish yo'li qisqa: katalog → savat → ism, telefon, manzil.
3. Tasdiqlanmagan va'da yozilmaydi (yetkazish muddati, kafolat, chegirma shartlari).
4. Do'kon egasi uchun hammasi oddiy: buyurtma va qoldiqni tez ko'rish va o'zgartirish.
