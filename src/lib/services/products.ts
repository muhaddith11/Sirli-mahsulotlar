import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/format";
import type { ProductQuery } from "@/lib/validation";

/** Katalog keshi tegi: mahsulot, kategoriya yoki qoldiq o'zgarganda yangilanadi */
export const CATALOG_TAG = "catalog";

/** Katalog so'rovlari 5 daqiqa keshlanadi (Neon "uyg'onishi"ni ham yashiradi) */
function cachedCatalog<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) {
  return unstable_cache(fn, [key], { tags: [CATALOG_TAG], revalidate: 300 });
}

export const productCardSelect = {
  id: true,
  name: true,
  nameRu: true,
  slug: true,
  price: true,
  discountPrice: true,
  images: true,
  stock: true,
  volume: true,
  pieces: true,
  category: { select: { name: true, nameRu: true, slug: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export type ProductList = {
  items: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function buildWhere(query: Partial<ProductQuery>): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };
  const and: Prisma.ProductWhereInput[] = [];

  if (query.q) {
    const contains = { contains: query.q, mode: "insensitive" } as const;
    and.push({
      OR: [
        { name: contains },
        { nameRu: contains },
        { description: contains },
        { descriptionRu: contains },
        { sku: contains },
        { category: { name: contains } },
        { category: { nameRu: contains } },
      ],
    });
  }

  if (query.category) where.category = { slug: query.category };
  if (query.featured) where.isFeatured = true;
  if (query.discounted) where.discountPrice = { not: null };

  // Narx filtri mijoz to'laydigan narx bo'yicha: chegirma bo'lsa — discountPrice, aks holda — price
  if (query.minPrice != null || query.maxPrice != null) {
    const range = {
      ...(query.minPrice != null && { gte: query.minPrice }),
      ...(query.maxPrice != null && { lte: query.maxPrice }),
    };
    and.push({ OR: [{ discountPrice: range }, { discountPrice: null, price: range }] });
  }

  if (and.length) where.AND = and;
  return where;
}

/** Mahsulotlarni qidirish, filtrlash va sahifalash */
async function listProductsUncached(
  query: Partial<ProductQuery>,
  options: { excludeIds?: string[] } = {},
): Promise<ProductList> {
  const where = buildWhere(query);
  if (options.excludeIds?.length) where.id = { notIn: options.excludeIds };
  const page = query.page ?? 1;
  const pageSize = query.limit ?? 12;
  const sort = query.sort ?? "popular";

  if (sort === "price_asc" || sort === "price_desc") {
    // Postgres'da COALESCE(discountPrice, price) bo'yicha Prisma orqali saralab bo'lmaydi,
    // shuning uchun avval yengil ro'yxatni olib, xotirada saralaymiz (katalog kichik).
    const rows = await prisma.product.findMany({
      where,
      select: { id: true, price: true, discountPrice: true },
    });
    const direction = sort === "price_asc" ? 1 : -1;
    rows.sort((a, b) => (effectivePrice(a) - effectivePrice(b)) * direction);
    const pageIds = rows.slice((page - 1) * pageSize, page * pageSize).map((r) => r.id);
    const items = await prisma.product.findMany({ where: { id: { in: pageIds } }, select: productCardSelect });
    items.sort((a, b) => pageIds.indexOf(a.id) - pageIds.indexOf(b.id));
    return { items, total: rows.length, page, pageSize, totalPages: Math.max(1, Math.ceil(rows.length / pageSize)) };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "new"
      ? [{ createdAt: "desc" }]
      : [{ isFeatured: "desc" }, { orderItems: { _count: "desc" } }, { createdAt: "desc" }];

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: productCardSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

/** generateMetadata va sahifa bitta so'rovni bo'lishishi uchun cache() bilan o'ralgan */
export const getProductBySlug = cache(async (slug: string) =>
  prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { category: { select: { id: true, name: true, nameRu: true, slug: true } } },
  }),
);

/** O'xshash mahsulotlar: avval shu kategoriyadan, yetmasa — boshqa kategoriyalardan to'ldiriladi */
async function getRelatedProductsUncached(categoryId: string, excludeId: string, take = 5) {
  const sameCategory = await prisma.product.findMany({
    where: { categoryId, isActive: true, id: { not: excludeId } },
    orderBy: [{ stock: "desc" }, { createdAt: "desc" }],
    take,
    select: productCardSelect,
  });
  if (sameCategory.length >= take) return sameCategory;

  const others = await prisma.product.findMany({
    where: { isActive: true, categoryId: { not: categoryId }, stock: { gt: 0 } },
    orderBy: [{ isFeatured: "desc" }, { orderItems: { _count: "desc" } }, { createdAt: "desc" }],
    take: take - sameCategory.length,
    select: productCardSelect,
  });
  return [...sameCategory, ...others];
}

/** "Eng ommabop" vitrinasi: omborda bor, foni olib tashlangan 360° kadrli mahsulotlar, ommaboplik tartibida */
async function listShowcaseProductsUncached(take = 6) {
  return prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 }, spinCutout: true, spinFrames: { isEmpty: false } },
    orderBy: [{ isFeatured: "desc" }, { orderItems: { _count: "desc" } }, { createdAt: "desc" }],
    take,
    select: { ...productCardSelect, spinFrames: true },
  });
}

/** Kategoriyalar va har biridagi faol mahsulotlar soni */
async function listCategoriesUncached() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      nameRu: true,
      slug: true,
      dishType: true,
      volume: true,
      collectionName: true,
      image: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
}

export const listProducts = cachedCatalog(listProductsUncached, "list-products");
export const getRelatedProducts = cachedCatalog(getRelatedProductsUncached, "related-products");
export const listCategories = cachedCatalog(listCategoriesUncached, "list-categories");
export const listShowcaseProducts = cachedCatalog(listShowcaseProductsUncached, "showcase-products");

export type CategoryWithCount = Awaited<ReturnType<typeof listCategoriesUncached>>[number];
