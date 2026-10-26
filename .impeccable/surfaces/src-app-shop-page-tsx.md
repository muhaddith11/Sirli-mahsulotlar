---
version: 1
slug: "src-app-shop-page-tsx"
primary_target: "src/app/(shop)/page.tsx"
related_targets: ["src/app/(shop)/products/page.tsx","src/app/(shop)/products/[slug]/page.tsx","src/app/(shop)/cart/page.tsx","src/app/(shop)/checkout/page.tsx"]
---

## Scope

Storefront: bosh sahifa, katalog, mahsulot, savat, checkout, muvaffaqiyat sahifasi — sayt va Telegram Mini App uchun bitta UI. Mode: Persuade (bosh sahifa), qolgan xarid oqimi Operate qoidalarida.

## Audience and job

Telegram, Instagram yoki do'kon orqali kelgan xaridor telefonda kategoriya tanlaydi, mahsulotni savatga qo'shadi va ism, telefon, manzil bilan buyurtma beradi. Egasi uchta yo'nalishni ko'rib, tanish marketpleys tartibini tanladi; sifat mo'ljali — Uzum Market.

## Direction contract

THESIS: Xaridor har kuni ishlatadigan marketpleys ilovasining o'zi, Uzum darajasida: tepada qidiruv, birinchi navbatda kategoriyalar, zich mahsulot panjarasi, aniq narx va bir bosishda savatga. Rad etiladi: bezakli "butik banner + bir xil kartalar" va har qanday mavzuli kostyum; farq bezakda emas, puxtalik va tezlikda.

OWN-WORLD: Oq mahsulot yuzalari ochiq iliq-kulrang sahifa fonida; bitta brend/harakat rangi — qizil (tugmalar, chegirma narxi, belgilar, faol tab); qora-jigarrang matn. Golos Text 400–700, narxlarda tabular raqamlar. Kartalar 12px, maydonlar 10px, chiplar to'liq yumaloq. Lucide ikonkalar 1.75 chiziq. Kartalar tinch holatda soyasiz, faqat yopishqoq panellarda yumshoq soya.

STORY: Xaridor ochadi → darhol qidiruv va kategoriya plitkalarini ko'radi → kategoriya yoki mahsulotga kiradi → panjaradan bir bosishda savatga qo'shadi → uch maydonli checkout bilan buyurtma beradi.

FIRST VIEWPORT: Telefon (390): yopishqoq sarlavha — chapda "Sirli" so'z belgisi, savat; ostida to'liq kenglikdagi qidiruv. Keyin kategoriya plitkalari (rasm + nom) gorizontal qatorda, birinchi ekranning yuqori yarmida. Ostida bitta ma'lumot paneli (butun O'zbekiston bo'ylab yetkazish, do'kondan olib ketish), keyin "Chegirmalar" qatori — narx, eski narx va "Savatga" tugmali kartalar. Kompyuter: sarlavhada Katalog tugmasi + keng qidiruv + savat; kategoriyalar 6 ustunda; panjara 5 ustunda. Asosiy harakat — kartadagi "Savatga".

SIGNATURE INTERACTION: Kartadagi "Savatga" tugmasi bosilganda o'sha joyning o'zida "− 1 +" miqdor tanlagichiga aylanadi (180ms ease-out), savat belgisidagi son sakrab yangilanadi. Harakat tili — qisqa, ease-out, faqat transform/opacity/width.

FORM: Category standard (canon), Uzum Market sifat mo'ljali, foydalanuvchi tanlovi; seed key 79f3e953.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

- Ranglar: qizil va krem saqlanadi (egasi). Pastki navigatsiya saqlanadi.
- O'zbek va rus tillari.
- Tasdiqlanmagan va'dalar yozilmaydi (yetkazish muddati, kafolat, reyting, sharhlar, muddatli to'lov).

## Unresolved

- Haqiqiy mahsulot rasmlari va logo yo'q — demo SVG va so'z belgisi.
