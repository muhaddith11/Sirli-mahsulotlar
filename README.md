# Sirli Mahsulotlar — emal idishlar do'koni va Telegram Mini App

Emal kastryulkalar va oshxona idishlarini sotish uchun internet-do'kon. Bitta Next.js ilovasi bir vaqtda:

- oddiy sayt (mobil qurilmalarga moslashgan),
- Telegram Mini App (bot menyusidan ochiladi, `MainButton` orqali buyurtma tasdiqlanadi),
- do'kon egasi uchun admin panel (`/admin`).

Har bir yangi buyurtma bazaga saqlangach, do'kon egasining Telegram'iga batafsil xabar yuboriladi — holatni shu xabardagi tugmalar bilan o'zgartirish mumkin.

Imkoniyatlar:

- **O'zbek va rus tillari** — til almashtirgich, Telegram'da foydalanuvchi tilidan avtomatik; mahsulot va kategoriyalar uchun ruscha nom/tavsif.
- **Yetkazib berish yoki do'kondan olib ketish**; 14 hudud bo'yicha narxni egasi admin paneldan kiritadi (bo'sh — "operator aytadi"), bepul yetkazish chegarasi.
- **Promokodlar** (foiz yoki summa, eng kam buyurtma, ishlatish soni, muddat).
- **360° ko'rinish** — admin mahsulot aylanayotgan videoni yuklaydi, brauzerning o'zi 36 ta kadr ajratadi, fonni olib tashlaydi va yuklaydi (video serverga bormaydi). Foni olingan mahsulotlar bosh sahifadagi **"Eng ommabop"** vitrinasida aylanib turadi.
- **Buyurtmalarim** — Telegram'da imzo orqali, saytda shu qurilmadagi buyurtmalar.
- Katalog keshi, spamdan himoya (IP bo'yicha so'rov chegarasi), kunlik tozalash cron'i.
- Dizayn tizimi: [DESIGN.md](DESIGN.md), mahsulot ma'lumotlari: [PRODUCT.md](PRODUCT.md).

**Texnologiyalar:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma 7 + PostgreSQL, Telegraf, `@twa-dev/sdk`, Zod.

---

## Tez boshlash

```bash
npm install
cp .env.example .env          # qiymatlarni to'ldiring
npx prisma migrate dev        # jadvallarni yaratish
npm run db:seed               # demo katalog va 14 hudud (xavfsiz: mavjudlarini o'zgartirmaydi)
npm run dev                   # http://localhost:3000
```

Admin panel: <http://localhost:3000/admin> — parol `.env` dagi `ADMIN_PASSWORD`.

### Lokal PostgreSQL yo'q bo'lsa

Prisma o'zining lokal bazasini ishga tushira oladi:

```bash
npx prisma dev --name sirli --detach
```

Chiqqan `postgres://...` manzilini `DATABASE_URL` ga yozing va `DATABASE_POOL_MAX="1"` qo'ying (bu lokal server bir vaqtda faqat bitta ulanishni qabul qiladi).

---

## Muhit o'zgaruvchilari (`.env`)

| O'zgaruvchi | Vazifasi |
|---|---|
| `DATABASE_URL` | PostgreSQL ulanish satri |
| `DATABASE_POOL_MAX` | Ixtiyoriy. Ulanishlar havzasi hajmi (serverless yoki `prisma dev` uchun) |
| `APP_URL` | Saytning ochiq manzili. Mini App va Telegram tugmalari uchun **https** bo'lishi shart |
| `TELEGRAM_BOT_TOKEN` | @BotFather bergan token |
| `TELEGRAM_BOT_USERNAME` | Bot username (@ belgisisiz) — saytdagi bot havolasi uchun |
| `TELEGRAM_ADMIN_CHAT_ID` | Buyurtma xabarlari boradigan chat ID. Bir nechta bo'lsa vergul bilan. Guruh ham bo'lishi mumkin (`-100...`) |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram webhook so'rovlarini tekshirish uchun maxfiy satr |
| `ADMIN_PASSWORD` | Admin panelga kirish paroli |
| `ADMIN_SESSION_SECRET` | Admin sessiyasini imzolash uchun kamida 32 belgili tasodifiy satr |
| `UPLOAD_DIR` | Admin yuklagan rasmlar papkasi (standart: `./uploads`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — bo'lsa, rasmlar Blob'ga yuklanadi |
| `CRON_SECRET` | Vercel Cron so'rovlarini tekshirish uchun |

---

## Telegram bot va Mini App'ni ulash

1. @BotFather → `/newbot` → tokenni `TELEGRAM_BOT_TOKEN` ga yozing.
2. Saytni HTTPS manzilga joylang (yoki lokal sinov uchun `ngrok http 3000` / `cloudflared tunnel`) va uni `APP_URL` ga yozing.
3. `npm run bot:setup` — bot menyusiga **"Do'kon"** tugmasini qo'shadi va webhook'ni o'rnatadi.
4. Botga `/id` yozing — u chat ID'ingizni qaytaradi. Uni `TELEGRAM_ADMIN_CHAT_ID` ga yozing va serverni qayta ishga tushiring.
5. Bot do'kon egasiga xabar yubora olishi uchun egasi botga avval `/start` yozgan bo'lishi kerak.

Bot buyruqlari: `/start` — do'kon va "Buyurtmalarim" tugmalari, `/yangi` — (egasi uchun) faol buyurtmalar, `/id` — chat ID.
Egasiga kelgan har bir buyurtma xabarida holat tugmalari bor (Tayyorlanmoqda → Yetkazilmoqda → Yakunlandi, bekor qilish — tasdiq bilan); mijozga yangi holat haqida o'z tilida xabar boradi.

Mini App ichida:
- foydalanuvchi ismi Telegram profilidan avtomatik to'ldiriladi, telefonni bir bosishda ulashish mumkin;
- mahsulot, savat va checkout sahifalarida asosiy amal Telegram'ning pastki **MainButton** tugmasida bo'ladi; "Orqaga" tugmasi ham Telegram'niki;
- server `initData` imzosini bot tokeni bilan tekshiradi va mijozni `User` jadvaliga (Telegram ID bo'yicha) yozadi;
- buyurtma qabul qilingani va keyingi status o'zgarishlari haqida mijozning o'ziga ham xabar boradi.

Telegram tokeni bo'lmasa ham do'kon ishlayveradi — xabarlar shunchaki yuborilmaydi (konsolda ogohlantirish chiqadi).

---

## Papka strukturasi

```
├─ prisma/
│  ├─ schema.prisma          # Ma'lumotlar modeli
│  ├─ seed.ts                # Demo kategoriya va mahsulotlar
│  └─ migrations/            # SQL migratsiyalar
├─ prisma.config.ts          # Prisma 7 sozlamalari (DATABASE_URL, seed)
├─ public/products/          # Demo mahsulot rasmlari (SVG)
├─ scripts/setup-bot.ts      # Bot menyusi va webhook'ni o'rnatish
└─ src/
   ├─ app/
   │  ├─ (shop)/             # Do'kon (sayt + Mini App) — umumiy layout, header, pastki menyu
   │  │  ├─ page.tsx         #   Bosh sahifa: banner, kategoriyalar, mahsulotlar
   │  │  ├─ products/        #   Katalog (qidiruv, filtr, saralash) va mahsulot sahifasi
   │  │  ├─ cart/            #   Savat
   │  │  └─ checkout/        #   Buyurtma berish va "qabul qilindi" sahifasi
   │  ├─ admin/
   │  │  ├─ login/           # Admin kirish sahifasi
   │  │  └─ (panel)/         # Himoyalangan bo'lim: dashboard, buyurtmalar, mahsulotlar, ombor, kategoriyalar
   │  └─ api/                # REST API (Route Handlers) — pastga qarang
   ├─ actions/admin/         # Admin uchun Server Actions (CRUD, status, qoldiq)
   ├─ components/
   │  ├─ shop/               # Do'kon komponentlari (kartochka, galereya, savat, checkout…)
   │  └─ admin/              # Admin komponentlari (formalar, jadval, status tanlovi…)
   ├─ providers/             # CartProvider (savat holati), TelegramProvider (WebApp SDK)
   ├─ hooks/use-main-button.ts  # Telegram MainButton'ni boshqarish
   ├─ lib/
   │  ├─ services/           # Biznes-mantiq: products, cart, orders
   │  ├─ telegram/           # Bot klienti, xabar shablonlari, initData tekshiruvi
   │  ├─ validation.ts       # Zod sxemalari
   │  ├─ auth.ts             # Admin sessiyasi (imzolangan cookie)
   │  └─ format.ts, constants.ts, prisma.ts …
   └─ generated/prisma/      # Prisma generatsiya qilgan klient (gitga kirmaydi)
```

Mantiq qatlamlarga bo'lingan: sahifalar va API'lar `lib/services/*` dagi funksiyalarni chaqiradi, shuning uchun bir xil qoidalar (qoldiq tekshiruvi, narx hisobi) hamma joyda bir xil ishlaydi.

---

## API

| Metod va manzil | Vazifasi |
|---|---|
| `GET /api/products?q=&category=&minPrice=&maxPrice=&sort=&discounted=1&page=&limit=` | Qidiruv, filtr (kategoriya, narx), saralash (`popular`, `new`, `price_asc`, `price_desc`), sahifalash |
| `GET /api/products/:slug` | Bitta mahsulot |
| `GET /api/categories` | Kategoriyalar va mahsulotlar soni |
| `GET /api/cart` · `DELETE /api/cart` | Savatni olish / tozalash |
| `POST /api/cart/items` `{ productId, quantity }` | Savatga qo'shish |
| `PATCH /api/cart/items/:productId` `{ quantity }` | Miqdorni o'zgartirish (`0` — o'chirish) |
| `DELETE /api/cart/items/:productId` | Savatdan o'chirish |
| `POST /api/checkout` `{ name, phone, address, comment?, initData? }` | Buyurtma berish → do'kon egasiga Telegram xabar |
| `POST /api/telegram/webhook` | Bot buyruqlari (`/start`, `/id`) |
| `POST /api/admin/upload` | Mahsulot rasmini yuklash (faqat admin) |

Savat brauzerdagi `cart_id` cookie orqali aniqlanadi. Narx filtri va saralash mijoz to'laydigan narx (chegirma bo'lsa — chegirma narxi) bo'yicha ishlaydi.

### Buyurtma berishda nima bo'ladi

Bitta tranzaksiyada: har bir mahsulot qoldig'i shartli kamaytiriladi (parallel buyurtmalarda manfiyga tushmaydi), nom va narx buyurtma paytidagi holatda `OrderItem` ga yoziladi, savat tozalanadi. Javob qaytgach (`after()`), Telegram xabarlari yuboriladi. Admin buyurtmani **Bekor qilindi** holatiga o'tkazsa, mahsulotlar omborga qaytariladi.

---

## Tekshiruvlar

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint (eslint-config-next)
npm test            # Vitest unit testlari (tests/)
```

GitHub'ga har push va PR'da `.github/workflows/ci.yml` shu tekshiruvlarni va `next build`ni bajaradi.

## Ishga tushirish (production)

```bash
npm run build      # prisma generate + next build
npm run db:deploy  # migratsiyalarni qo'llash
npm start
```

- Admin yuklagan rasmlar: `BLOB_READ_WRITE_TOKEN` bo'lsa — Vercel Blob'ga, aks holda `UPLOAD_DIR` papkasiga diskka yoziladi. VPS/Docker'da shu papkani doimiy volume qiling.
- **Vercel:** `vercel-build` skripti har deployda `prisma migrate deploy` ni bajaradi. Neon integratsiyasi `DATABASE_URL` (pooler) va `DATABASE_URL_UNPOOLED` (migratsiyalar uchun) ni o'zi qo'shadi; Blob store ulanganda `BLOB_READ_WRITE_TOKEN` paydo bo'ladi.
- Productionda savat cookie'si `SameSite=None; Secure` — Telegram Web Mini App'ni iframe ichida ochadi.

## Demo matnlar

Bosh sahifadagi va mahsulot sahifasidagi afzalliklar ("1–2 kunda yetkazish", "14 kun ichida qaytarish" va h.k.), footer'dagi telefon va ish vaqti — namuna. Ularni o'z shartlaringizga moslab o'zgartiring: `src/app/(shop)/page.tsx`, `src/app/(shop)/products/[slug]/page.tsx`, `src/components/shop/footer.tsx`.
