import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type DishType } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type SeedCategory = {
  slug: string;
  name: string;
  nameRu: string;
  dishType: DishType;
  volume?: string;
  collectionName?: string;
  description: string;
  image: string;
  sortOrder: number;
};

const categories: SeedCategory[] = [
  {
    slug: "kastryulkalar",
    nameRu: "Кастрюли",
    name: "Kastryulkalar",
    dishType: "POT",
    volume: "2–16 L",
    description: "Qopqoqli emal kastryulkalar — sho'rva, palov va kompot uchun.",
    image: "/products/pot-strawberry.svg",
    sortOrder: 1,
  },
  {
    slug: "toplamlar",
    nameRu: "Наборы",
    name: "To'plamlar",
    dishType: "SET",
    collectionName: "Ko'knori, Qulupnay",
    description: "Bir xil naqshli kastryulka to'plamlari — sovg'a uchun ayni muddao.",
    image: "/products/set-poppy.svg",
    sortOrder: 2,
  },
  {
    slug: "choynaklar",
    nameRu: "Чайники",
    name: "Choynaklar",
    dishType: "KETTLE",
    volume: "2–3 L",
    description: "Gaz va elektr plitalari uchun emal choynaklar.",
    image: "/products/kettle-rose.svg",
    sortOrder: 3,
  },
  {
    slug: "togoralar",
    nameRu: "Тазы",
    name: "Tog'oralar",
    dishType: "BOWL",
    description: "Xamir qorish, meva-sabzavot yuvish uchun keng tog'oralar.",
    image: "/products/bowl-spring.svg",
    sortOrder: 4,
  },
  {
    slug: "krujkalar",
    nameRu: "Кружки",
    name: "Krujkalar",
    dishType: "MUG",
    volume: "400 ml",
    description: "Retro uslubdagi emal krujkalar.",
    image: "/products/mug-lemon.svg",
    sortOrder: 5,
  },
  {
    slug: "kovshlar",
    nameRu: "Ковши",
    name: "Kovshlar",
    dishType: "LADLE",
    volume: "1–2 L",
    description: "Sut qaynatish va kichik taomlar uchun dastali kovshlar.",
    image: "/products/ladle-blue.svg",
    sortOrder: 6,
  },
];

type SeedProduct = {
  slug: string;
  sku: string;
  name: string;
  nameRu: string;
  descriptionRu: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  volume?: string;
  pieces?: number;
  isFeatured?: boolean;
  images: string[];
  /** 360° kadrlar (1 ta bo'lsa — aylanmaydigan shaffof rasm, faqat vitrina uchun) */
  spinFrames?: string[];
  spinCutout?: boolean;
  description: string;
};

const spinFrames = (dir: string) => Array.from({ length: 36 }, (_, i) => `/spin/${dir}/${String(i).padStart(2, "0")}.webp`);

/** 3D modeldan: har 10° kadr (NN.webp) va orasidagi 5° kadr (NN.5.webp) — 72 kadr, aylanish silliqroq */
const modelFrames = (dir: string) => spinFrames(dir).flatMap((frame) => [frame, frame.replace(".webp", ".5.webp")]);

/** Yangi 3D modellar: 72 kadr (00–71.webp) */
const denseFrames = (dir: string) => Array.from({ length: 72 }, (_, i) => `/spin/${dir}/${String(i).padStart(2, "0")}.webp`);

/** Demo rasmdan yasalgan 360° kadrlar (naqsh idish atrofida aylanadi) — "Eng ommabop" vitrinasida aylanib turadi */
const cutout = (name: string) => ({ spinFrames: spinFrames(name), spinCutout: true });

/** Avvalgi bitta kadrli demo rasm — 36 kadrga almashtiriladi */
const isDemoPlaceholder = (frames: string[]) => frames.length === 1 && frames[0].startsWith("/products/cutout/");

const products: SeedProduct[] = [
  {
    // Egasining rasmidan yasalgan 3D model — 360° kadrlar /public/spin ichida
    slug: "choynak-gilos",
    nameRu: "Эмалированный чайник «Вишня»",
    descriptionRu: "Белый эмалированный чайник с рисунком вишни, яблок и белых цветов. С крышкой и металлической ручкой.",
    sku: "CH-GLS",
    name: 'Emal choynak "Gilos"',
    category: "choynaklar",
    price: 165_000,
    stock: 10,
    isFeatured: true,
    images: ["/products/choynak-gilos.webp", "/products/choynak-gilos-foto.webp"],
    spinFrames: modelFrames("choynak-gilos"),
    spinCutout: true,
    description: "Oq emal choynak, gilos, olma va oq gullar naqshi bilan. Qopqog'i va metall dastasi bor.",
  },
  {
    // Egasining 4 ta rasmidan yasalgan 3D model — ikki tomonida kulgich yuz
    slug: "choynak-kulgich",
    nameRu: "Эмалированный чайник «Смайлик»",
    descriptionRu: "Жёлтый эмалированный чайник с улыбающимся лицом с двух сторон. С крышкой и чёрной металлической ручкой.",
    sku: "CH-KLG",
    name: 'Emal choynak "Kulgich"',
    category: "choynaklar",
    price: 165_000,
    stock: 10,
    isFeatured: true,
    images: [
      "/products/choynak-kulgich.webp",
      "/products/choynak-kulgich-foto-1.webp",
      "/products/choynak-kulgich-foto-2.webp",
      "/products/choynak-kulgich-foto-3.webp",
      "/products/choynak-kulgich-foto-4.webp",
    ],
    spinFrames: denseFrames("choynak-kulgich"),
    spinCutout: true,
    description: "Sariq emal choynak, ikki tomonida kulgich yuz. Qopqog'i va qora metall dastasi bor.",
  },
  {
    // Egasining 4 ta rasmidan yasalgan 3D model — ikki tomonida pion guli
    slug: "choynak-pion",
    nameRu: "Эмалированный чайник «Пион»",
    descriptionRu: "Кремовый эмалированный чайник с розовыми пионами с двух сторон. С крышкой и чёрной металлической ручкой.",
    sku: "CH-PIO",
    name: 'Emal choynak "Pion"',
    category: "choynaklar",
    price: 165_000,
    stock: 10,
    isFeatured: true,
    images: [
      "/products/choynak-pion.webp",
      "/products/choynak-pion-foto-1.webp",
      "/products/choynak-pion-foto-2.webp",
      "/products/choynak-pion-foto-3.webp",
      "/products/choynak-pion-foto-4.webp",
    ],
    spinFrames: denseFrames("choynak-pion"),
    spinCutout: true,
    description: "Oqish emal choynak, ikki tomonida pushti pion gullari. Qopqog'i va qora metall dastasi bor.",
  },
  {
    // Egasining 4 ta rasmidan yasalgan 3D model — sepkillar rasmdagi sepkillardan olingan
    slug: "kastryulka-sepkil",
    nameRu: "Эмалированная кастрюля «Крапинка»",
    descriptionRu: "Светло-коричневая эмалированная кастрюля в чёрную крапинку. С крышкой и двумя ручками.",
    sku: "KS-SPK",
    name: 'Emal kastryulka "Sepkil"',
    category: "kastryulkalar",
    price: 165_000,
    stock: 10,
    isFeatured: true,
    images: [
      "/products/kastryulka-sepkil.webp",
      "/products/kastryulka-sepkil-foto-1.webp",
      "/products/kastryulka-sepkil-foto-2.webp",
      "/products/kastryulka-sepkil-foto-3.webp",
      "/products/kastryulka-sepkil-foto-4.webp",
    ],
    spinFrames: denseFrames("kastryulka-sepkil"),
    spinCutout: true,
    description: "Och jigarrang emal kastryulka, qora sepkilli naqsh bilan. Qopqog'i va ikki dastasi bor.",
  },
  {
    // Egasining 4 ta rasmidan yasalgan 3D model — ikki tomonida gul savati manzarasi
    slug: "choynak-natyurmort",
    nameRu: "Эмалированный чайник «Натюрморт»",
    descriptionRu: "Кремовый эмалированный чайник с рисунком: корзина цветов, кувшин и фонарь. С крышкой и чёрной металлической ручкой.",
    sku: "CH-NTM",
    name: 'Emal choynak "Natyurmort"',
    category: "choynaklar",
    price: 165_000,
    stock: 10,
    isFeatured: true,
    images: [
      "/products/choynak-natyurmort.webp",
      "/products/choynak-natyurmort-foto-1.webp",
      "/products/choynak-natyurmort-foto-2.webp",
      "/products/choynak-natyurmort-foto-3.webp",
      "/products/choynak-natyurmort-foto-4.webp",
    ],
    spinFrames: denseFrames("choynak-natyurmort"),
    spinCutout: true,
    description: "Oqish emal choynak, ikki tomonida gul savati, ko'za va chiroq tasviri. Qopqog'i va qora metall dastasi bor.",
  },
  {
    // Egasining 4 ta rasmidan yasalgan 3D model — shisha qopqoq, ustida "Горница" yozuvi
    slug: "qozon-gornitsa",
    nameRu: "Казан «Горница»",
    descriptionRu: "Чёрный казан с белой крапинкой. Со стеклянной крышкой, стальной ручкой и двумя ручками-ушками.",
    sku: "QZ-GRN",
    name: 'Qozon "Gornitsa"',
    category: "kastryulkalar",
    price: 165_000,
    stock: 10,
    isFeatured: true,
    images: [
      "/products/qozon-gornitsa.webp",
      "/products/qozon-gornitsa-foto-1.webp",
      "/products/qozon-gornitsa-foto-2.webp",
      "/products/qozon-gornitsa-foto-3.webp",
      "/products/qozon-gornitsa-foto-4.webp",
    ],
    spinFrames: denseFrames("qozon-gornitsa"),
    spinCutout: true,
    description: "Qora qozon, oq sepkilli sirt bilan. Shisha qopqog'i, po'lat tutqichi va ikki quloqli dastasi bor.",
  },
  {
    slug: "kastryulka-qulupnay-16l",
    ...cutout("pot-strawberry"),
    nameRu: "Эмалированная кастрюля «Клубника» 16 л",
    descriptionRu: "Эмалированная кастрюля с толстыми стенками для большой семьи и праздников.\n\n• Объём: 16 литров\n• С крышкой\n• Подходит для газовых, электрических и индукционных плит\n• Внутреннее покрытие — пищевая эмаль",
    sku: "KS-QLP-16",
    name: 'Emal kastryulka "Qulupnay" 16 L',
    category: "kastryulkalar",
    price: 385_000,
    discountPrice: 329_000,
    stock: 12,
    volume: "16 L",
    isFeatured: true,
    images: ["/products/pot-strawberry.svg", "/products/set-strawberry.svg"],
    description:
      "Katta oila va to'ylar uchun mo'ljallangan qalin devorli emal kastryulka.\n\n• Hajmi: 16 litr\n• Qopqog'i bilan\n• Gaz, elektr va induksion plitalarga mos\n• Ichki qatlam — oziq-ovqat uchun xavfsiz emal",
  },
  {
    slug: "kastryulka-gilos-3l",
    ...cutout("pot-cherry"),
    nameRu: "Эмалированная кастрюля «Вишня» 3 л",
    descriptionRu: "Кастрюля удобного размера для ежедневной готовки. Белая эмаль с рисунком вишни.\n\n• Объём: 3 литра\n• Подходит для всех типов плит",
    sku: "KS-GLS-3",
    name: 'Emal kastryulka "Gilos" 3 L',
    category: "kastryulkalar",
    price: 145_000,
    stock: 25,
    volume: "3 L",
    isFeatured: true,
    images: ["/products/pot-cherry.svg"],
    description:
      "Kundalik pishiriq uchun qulay o'lchamdagi kastryulka. Oq emal ustida qo'lda chizilgandek gilos naqshi.\n\n• Hajmi: 3 litr\n• Barcha turdagi plitalarga mos",
  },
  {
    slug: "kastryulka-gilos-5l",
    nameRu: "Эмалированная кастрюля «Вишня» 5 л",
    descriptionRu: "Кастрюля среднего размера из серии «Вишня».\n\n• Объём: 5 литров\n• С крышкой",
    sku: "KS-GLS-5",
    name: 'Emal kastryulka "Gilos" 5 L',
    category: "kastryulkalar",
    price: 175_000,
    discountPrice: 159_000,
    stock: 3,
    volume: "5 L",
    images: ["/products/pot-cherry.svg"],
    description: "\"Gilos\" seriyasining o'rta o'lchamdagi kastryulkasi.\n\n• Hajmi: 5 litr\n• Qopqog'i bilan",
  },
  {
    slug: "kastryulka-good-food-4l",
    nameRu: "Кастрюля «Good Food» 4 л",
    descriptionRu: "Минималистичный дизайн для современной кухни: белая эмаль и чёрная надпись.\n\n• Объём: 4 литра\n• С крышкой",
    sku: "KS-GF-4",
    name: 'Kastryulka "Good Food" 4 L',
    category: "kastryulkalar",
    price: 210_000,
    stock: 8,
    volume: "4 L",
    isFeatured: true,
    images: ["/products/pot-good-food.svg", "/products/pot-my-kitchen.svg"],
    description: "Zamonaviy oshxona uchun minimalistik dizayn: oq emal va qora yozuv.\n\n• Hajmi: 4 litr\n• Qopqog'i bilan",
  },
  {
    slug: "kastryulka-my-kitchen-4l",
    nameRu: "Кастрюля «My Kitchen» чёрная 4 л",
    descriptionRu: "Чёрная эмаль и золотистая кромка — современный вид для вашей кухни.\n\n• Объём: 4 литра",
    sku: "KS-MK-4",
    name: 'Kastryulka "My Kitchen" qora 4 L',
    category: "kastryulkalar",
    price: 225_000,
    discountPrice: 199_000,
    stock: 6,
    volume: "4 L",
    images: ["/products/pot-my-kitchen.svg", "/products/pot-good-food.svg"],
    description: "Qora emal va oltinrang qirralar. Oshxonangizga zamonaviy ko'rinish beradi.\n\n• Hajmi: 4 litr",
  },
  {
    slug: "kastryulka-moviy-nuqta-4l",
    nameRu: "Кастрюля «Синий горошек» 4 л",
    descriptionRu: "Классическая синяя эмаль в белый горошек.\n\n• Объём: 4 литра",
    sku: "KS-MN-4",
    name: 'Kastryulka "Moviy nuqta" 4 L',
    category: "kastryulkalar",
    price: 195_000,
    stock: 14,
    volume: "4 L",
    images: ["/products/pot-blue-dots.svg", "/products/ladle-blue.svg"],
    description: "Klassik ko'k emal va oq nuqtalar — turkcha uslubdagi kastryulka.\n\n• Hajmi: 4 litr",
  },
  {
    slug: "toplam-koknori-6",
    ...cutout("set-poppy"),
    nameRu: "Набор кастрюль «Мак» (6 предметов)",
    descriptionRu: "Набор из 3 кастрюль и 3 крышек с красными маками.\n\n• Объёмы: 2, 3 и 4 литра",
    sku: "NB-KKN-6",
    name: 'Kastryulka to\'plami "Ko\'knori" (6 dona)',
    category: "toplamlar",
    price: 690_000,
    discountPrice: 599_000,
    stock: 6,
    volume: "2 / 3 / 4 L",
    pieces: 6,
    isFeatured: true,
    images: ["/products/set-poppy.svg", "/products/pot-strawberry.svg"],
    description:
      "3 ta kastryulka va 3 ta qopqoqdan iborat to'plam. Qizil ko'knori gullari bilan bezatilgan.\n\n• Hajmlar: 2, 3 va 4 litr",
  },
  {
    slug: "toplam-qulupnay-15",
    nameRu: "Эмалированный набор «Клубника» (15 предметов)",
    descriptionRu: "Полный набор для кухни: кастрюли, чайник, ковш и таз.\n\n• 15 предметов",
    sku: "NB-QLP-15",
    name: 'Emal to\'plam "Qulupnay" (15 dona)',
    category: "toplamlar",
    price: 1_250_000,
    stock: 4,
    pieces: 15,
    isFeatured: true,
    images: ["/products/set-strawberry.svg", "/products/kettle-rose.svg"],
    description:
      "Oshxona uchun to'liq jamlanma: kastryulkalar, choynak, kovsh va tog'ora.\n\n• 15 dona buyum",
  },
  {
    slug: "choynak-atirgul-2-5l",
    nameRu: "Эмалированный чайник «Роза» 2,5 л",
    descriptionRu: "Чайник с розовыми розами. Деревянная ручка не нагревается.\n\n• Объём: 2,5 литра",
    sku: "CH-ATR-25",
    name: 'Emal choynak "Atirgul" 2.5 L',
    category: "choynaklar",
    price: 165_000,
    stock: 15,
    volume: "2.5 L",
    isFeatured: true,
    images: ["/products/kettle-rose.svg"],
    description: "Pushti atirgullar bilan bezatilgan choynak. Yog'och dastasi qizimaydi.\n\n• Hajmi: 2.5 litr",
  },
  {
    slug: "choynak-limon-3l",
    nameRu: "Эмалированный чайник «Лимон» 3 л",
    descriptionRu: "Чайник с ярким лимонным узором.\n\n• Объём: 3 литра",
    sku: "CH-LMN-3",
    name: 'Emal choynak "Limon" 3 L',
    category: "choynaklar",
    price: 155_000,
    discountPrice: 139_000,
    stock: 0,
    volume: "3 L",
    images: ["/products/kettle-lemon.svg"],
    description: "Yorqin limon naqshli choynak.\n\n• Hajmi: 3 litr",
  },
  {
    slug: "togora-bahor-40",
    ...cutout("bowl-spring"),
    nameRu: "Таз «Весна» 40 см",
    descriptionRu: "Широкий и глубокий таз — для теста, мытья фруктов и овощей.\n\n• Диаметр: 40 см\n• Объём: 8 литров",
    sku: "TG-BHR-40",
    name: 'Tog\'ora "Bahor" 40 sm',
    category: "togoralar",
    price: 120_000,
    stock: 20,
    volume: "8 L",
    images: ["/products/bowl-spring.svg"],
    description: "Keng va chuqur tog'ora — xamir qorish, meva yuvish uchun.\n\n• Diametri: 40 sm\n• Hajmi: 8 litr",
  },
  {
    slug: "krujka-limon-400",
    nameRu: "Кружка «Лимон» 400 мл",
    descriptionRu: "Эмалированная кружка в ретро-стиле для чая и кофе.\n\n• Объём: 400 мл",
    sku: "KR-LMN-04",
    name: 'Krujka "Limon" 400 ml',
    category: "krujkalar",
    price: 45_000,
    stock: 40,
    volume: "400 ml",
    images: ["/products/mug-lemon.svg"],
    description: "Choy va qahva uchun retro emal krujka.\n\n• Hajmi: 400 ml",
  },
  {
    slug: "krujka-gilos-400",
    ...cutout("mug-cherry"),
    nameRu: "Кружка «Вишня» 400 мл",
    descriptionRu: "Эмалированная кружка с рисунком вишни.\n\n• Объём: 400 мл",
    sku: "KR-GLS-04",
    name: 'Krujka "Gilos" 400 ml',
    category: "krujkalar",
    price: 45_000,
    stock: 2,
    volume: "400 ml",
    images: ["/products/mug-cherry.svg"],
    description: "Gilos naqshli emal krujka.\n\n• Hajmi: 400 ml",
  },
  {
    slug: "kovsh-moviy-1-5l",
    ...cutout("ladle-blue"),
    nameRu: "Ковш «Синий горошек» 1,5 л",
    descriptionRu: "Ковш с длинной ручкой для кипячения молока.\n\n• Объём: 1,5 литра",
    sku: "KV-MV-15",
    name: 'Kovsh "Moviy nuqta" 1.5 L',
    category: "kovshlar",
    price: 89_000,
    stock: 18,
    volume: "1.5 L",
    images: ["/products/ladle-blue.svg"],
    description: "Sut qaynatish uchun uzun dastali kovsh.\n\n• Hajmi: 1.5 litr",
  },
];

// Yetkazib berish hududlari. Narxlar ataylab kiritilmagan (null — "operator aytadi"):
// haqiqiy narxlarni do'kon egasi admin paneldagi "Yetkazib berish" bo'limida kiritadi.
const zones: { name: string; nameRu: string }[] = [
  { name: "Toshkent shahri", nameRu: "г. Ташкент" },
  { name: "Toshkent viloyati", nameRu: "Ташкентская область" },
  { name: "Andijon viloyati", nameRu: "Андижанская область" },
  { name: "Buxoro viloyati", nameRu: "Бухарская область" },
  { name: "Farg'ona viloyati", nameRu: "Ферганская область" },
  { name: "Jizzax viloyati", nameRu: "Джизакская область" },
  { name: "Xorazm viloyati", nameRu: "Хорезмская область" },
  { name: "Namangan viloyati", nameRu: "Наманганская область" },
  { name: "Navoiy viloyati", nameRu: "Навоийская область" },
  { name: "Qashqadaryo viloyati", nameRu: "Кашкадарьинская область" },
  { name: "Qoraqalpog'iston Respublikasi", nameRu: "Республика Каракалпакстан" },
  { name: "Samarqand viloyati", nameRu: "Самаркандская область" },
  { name: "Sirdaryo viloyati", nameRu: "Сырдарьинская область" },
  { name: "Surxondaryo viloyati", nameRu: "Сурхандарьинская область" },
];

async function main() {
  const categoryIds = new Map<string, string>();

  // Xavfsiz seed: mavjud yozuvlar ustidan yozilmaydi (egasining narx, qoldiq va matnlari saqlanadi),
  // faqat yo'qlari qo'shiladi va bo'sh ruscha maydonlar to'ldiriladi. Jonli bazada ham ishlatish mumkin.
  for (const { slug, ...data } of categories) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    const category = existing
      ? await prisma.category.update({ where: { slug }, data: { nameRu: existing.nameRu ?? data.nameRu } })
      : await prisma.category.create({ data: { slug, ...data } });
    categoryIds.set(slug, category.id);
  }

  for (const { slug, category, ...data } of products) {
    const categoryId = categoryIds.get(category);
    if (!categoryId) throw new Error(`Kategoriya topilmadi: ${category}`);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      await prisma.product.update({
        where: { slug },
        data: {
          nameRu: existing.nameRu ?? data.nameRu,
          descriptionRu: existing.descriptionRu ?? data.descriptionRu,
          // 360° faqat bo'sh (yoki eski demo rasm) bo'lsa to'ldiriladi — egasi yuklagan kadrlar saqlanadi
          ...((existing.spinFrames.length === 0 || isDemoPlaceholder(existing.spinFrames)) && data.spinFrames
            ? { spinFrames: data.spinFrames, spinCutout: data.spinCutout ?? false }
            : {}),
        },
      });
    } else {
      await prisma.product.create({ data: { slug, categoryId, ...data } });
    }
  }

  // Hududlar faqat bo'sh bazaga qo'shiladi — egasi kiritgan narxlar ustidan yozilmaydi
  if ((await prisma.deliveryZone.count()) === 0) {
    await prisma.deliveryZone.createMany({ data: zones.map((zone, i) => ({ ...zone, sortOrder: i })) });
  }
  await prisma.storeSettings.upsert({ where: { id: "store" }, create: { id: "store" }, update: {} });

  console.log(`✔ ${categories.length} ta kategoriya, ${products.length} ta mahsulot, ${zones.length} ta hudud`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
