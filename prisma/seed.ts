import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type DishType } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type SeedCategory = {
  slug: string;
  name: string;
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
    name: "Kastryulkalar",
    dishType: "POT",
    volume: "2–16 L",
    description: "Qopqoqli emal kastryulkalar — sho'rva, palov va kompot uchun.",
    image: "/products/pot-strawberry.svg",
    sortOrder: 1,
  },
  {
    slug: "toplamlar",
    name: "To'plamlar",
    dishType: "SET",
    collectionName: "Ko'knori, Qulupnay",
    description: "Bir xil naqshli kastryulka to'plamlari — sovg'a uchun ayni muddao.",
    image: "/products/set-poppy.svg",
    sortOrder: 2,
  },
  {
    slug: "choynaklar",
    name: "Choynaklar",
    dishType: "KETTLE",
    volume: "2–3 L",
    description: "Gaz va elektr plitalari uchun emal choynaklar.",
    image: "/products/kettle-rose.svg",
    sortOrder: 3,
  },
  {
    slug: "togoralar",
    name: "Tog'oralar",
    dishType: "BOWL",
    description: "Xamir qorish, meva-sabzavot yuvish uchun keng tog'oralar.",
    image: "/products/bowl-spring.svg",
    sortOrder: 4,
  },
  {
    slug: "krujkalar",
    name: "Krujkalar",
    dishType: "MUG",
    volume: "400 ml",
    description: "Retro uslubdagi emal krujkalar.",
    image: "/products/mug-lemon.svg",
    sortOrder: 5,
  },
  {
    slug: "kovshlar",
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
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  volume?: string;
  pieces?: number;
  isFeatured?: boolean;
  images: string[];
  description: string;
};

const products: SeedProduct[] = [
  {
    slug: "kastryulka-qulupnay-16l",
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
      "3 ta kastryulka va 3 ta qopqoqdan iborat to'plam. Qizil ko'knori gullari bilan bezatilgan.\n\n• Hajmlar: 2, 3 va 4 litr\n• Chiroyli sovg'a qutisida",
  },
  {
    slug: "toplam-qulupnay-15",
    sku: "NB-QLP-15",
    name: 'Emal to\'plam "Qulupnay" (15 dona)',
    category: "toplamlar",
    price: 1_250_000,
    stock: 4,
    pieces: 15,
    isFeatured: true,
    images: ["/products/set-strawberry.svg", "/products/kettle-rose.svg"],
    description:
      "Oshxona uchun to'liq jamlanma: kastryulkalar, choynak, kovsh va tog'ora.\n\n• 15 dona buyum\n• Sovg'a qutisida\n• Ishlab chiqaruvchi kafolati",
  },
  {
    slug: "choynak-atirgul-2-5l",
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

async function main() {
  const categoryIds = new Map<string, string>();

  for (const { slug, ...data } of categories) {
    const category = await prisma.category.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
    categoryIds.set(slug, category.id);
  }

  for (const { slug, category, ...data } of products) {
    const categoryId = categoryIds.get(category);
    if (!categoryId) throw new Error(`Kategoriya topilmadi: ${category}`);
    await prisma.product.upsert({
      where: { slug },
      create: { slug, categoryId, ...data },
      update: { categoryId, ...data },
    });
  }

  console.log(`✔ ${categories.length} ta kategoriya va ${products.length} ta mahsulot qo'shildi`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
