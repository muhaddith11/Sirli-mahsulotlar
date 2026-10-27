-- Bir martalik ma'lumot migratsiyasi: "Eng ommabop" vitrinasi uchun kontent.
-- Seed bilan bir xil, xavfsiz: mavjud mahsulot yoki egasi yuklagan 360° kadrlar ustidan yozilmaydi.

-- Emal choynak "Gilos" — egasining rasmidan yasalgan 3D model (kadrlar public/spin ichida)
INSERT INTO "Product" ("id", "name", "nameRu", "slug", "sku", "description", "descriptionRu", "price", "images",
  "spinFrames", "spinCutout", "stock", "isActive", "isFeatured", "categoryId", "createdAt", "updatedAt")
SELECT 'choynakgilos3d0000000000001', 'Emal choynak "Gilos"', 'Эмалированный чайник «Вишня»', 'choynak-gilos', 'CH-GLS',
  'Oq emal choynak, gilos, olma va oq gullar naqshi bilan. Qopqog''i va metall dastasi bor.',
  'Белый эмалированный чайник с рисунком вишни, яблок и белых цветов. С крышкой и металлической ручкой.',
  165000, ARRAY['/products/choynak-gilos.webp', '/products/choynak-gilos-foto.webp'],
  ARRAY['/spin/choynak-gilos/00.webp','/spin/choynak-gilos/01.webp','/spin/choynak-gilos/02.webp','/spin/choynak-gilos/03.webp','/spin/choynak-gilos/04.webp','/spin/choynak-gilos/05.webp','/spin/choynak-gilos/06.webp','/spin/choynak-gilos/07.webp','/spin/choynak-gilos/08.webp','/spin/choynak-gilos/09.webp','/spin/choynak-gilos/10.webp','/spin/choynak-gilos/11.webp','/spin/choynak-gilos/12.webp','/spin/choynak-gilos/13.webp','/spin/choynak-gilos/14.webp','/spin/choynak-gilos/15.webp','/spin/choynak-gilos/16.webp','/spin/choynak-gilos/17.webp','/spin/choynak-gilos/18.webp','/spin/choynak-gilos/19.webp','/spin/choynak-gilos/20.webp','/spin/choynak-gilos/21.webp','/spin/choynak-gilos/22.webp','/spin/choynak-gilos/23.webp','/spin/choynak-gilos/24.webp','/spin/choynak-gilos/25.webp','/spin/choynak-gilos/26.webp','/spin/choynak-gilos/27.webp','/spin/choynak-gilos/28.webp','/spin/choynak-gilos/29.webp','/spin/choynak-gilos/30.webp','/spin/choynak-gilos/31.webp','/spin/choynak-gilos/32.webp','/spin/choynak-gilos/33.webp','/spin/choynak-gilos/34.webp','/spin/choynak-gilos/35.webp'], true, 10, true, true, c."id", NOW(), NOW()
FROM "Category" c
WHERE c."slug" = 'choynaklar'
ON CONFLICT DO NOTHING;

-- Demo mahsulotlarning fonsiz rasmlari (360° bo'sh bo'lsa)
UPDATE "Product" SET "spinFrames" = ARRAY['/products/cutout/pot-strawberry.svg'], "spinCutout" = true
WHERE "slug" = 'kastryulka-qulupnay-16l' AND COALESCE(cardinality("spinFrames"), 0) = 0;
UPDATE "Product" SET "spinFrames" = ARRAY['/products/cutout/pot-cherry.svg'], "spinCutout" = true
WHERE "slug" = 'kastryulka-gilos-3l' AND COALESCE(cardinality("spinFrames"), 0) = 0;
UPDATE "Product" SET "spinFrames" = ARRAY['/products/cutout/bowl-spring.svg'], "spinCutout" = true
WHERE "slug" = 'togora-bahor-40' AND COALESCE(cardinality("spinFrames"), 0) = 0;
UPDATE "Product" SET "spinFrames" = ARRAY['/products/cutout/ladle-blue.svg'], "spinCutout" = true
WHERE "slug" = 'kovsh-moviy-1-5l' AND COALESCE(cardinality("spinFrames"), 0) = 0;
UPDATE "Product" SET "spinFrames" = ARRAY['/products/cutout/mug-cherry.svg'], "spinCutout" = true
WHERE "slug" = 'krujka-gilos-400' AND COALESCE(cardinality("spinFrames"), 0) = 0;
UPDATE "Product" SET "spinFrames" = ARRAY['/products/cutout/set-poppy.svg'], "spinCutout" = true
WHERE "slug" = 'toplam-koknori-6' AND COALESCE(cardinality("spinFrames"), 0) = 0;
