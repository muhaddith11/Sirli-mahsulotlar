-- 3D modellar egasining o'z mahsulotlariga ko'chiriladi: nomi, narxi, qoldig'i va rasmlari o'zgarmaydi.
-- Nusxalar o'chirilmaydi, yashiriladi: buyurtmalar tarixi saqlanib qoladi.
-- Egasining mahsuloti topilmasa yoki unda o'z 360° kadrlari bo'lsa, nusxaga tegilmaydi.
WITH pairs (dup_slug, own_slug) AS (
  VALUES
    ('choynak-kulgich', 'choynak-smile-3-5-litr'),
    ('choynak-pion', 'choynak-buket-pionov-3-5l'),
    ('choynak-natyurmort', 'choynak-letniy-etud-3-5l'),
    ('kastryulka-sepkil', 'emal-kastryulka-3-l'),
    ('choynak-gornitsa', 'choynak-svistok-gornitsa-3l'),
    ('choynak-zepter', 'choynak-svistok-mramor-3l'),
    ('choynak-emerald', 'elektr-choy-qaynatgich-emerald-2-5l'),
    ('toplam-qoziqorin-3', 'nabor-kastryulka-gribi-3ta')
), moved AS (
  UPDATE "Product" AS own
  SET "spinFrames" = dup."spinFrames",
      "spinCutout" = true,
      "inShowcase" = dup."inShowcase",
      "updatedAt" = CURRENT_TIMESTAMP
  FROM pairs
  JOIN "Product" AS dup ON dup."slug" = pairs.dup_slug
  WHERE own."slug" = pairs.own_slug
    AND cardinality(own."spinFrames") = 0
  RETURNING dup."id" AS dup_id
)
UPDATE "Product"
SET "isActive" = false,
    "inShowcase" = false,
    "spinFrames" = '{}',
    "spinCutout" = false,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN (SELECT dup_id FROM moved);
