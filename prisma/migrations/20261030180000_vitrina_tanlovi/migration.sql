-- Vitrinaga qaysi 3D mahsulot chiqishini endi admin tanlaydi.
ALTER TABLE "Product" ADD COLUMN "inShowcase" BOOLEAN NOT NULL DEFAULT false;

-- Hozir vitrinada turganlar joyida qoladi.
UPDATE "Product"
SET "inShowcase" = true
WHERE "id" IN (
  SELECT "id" FROM "Product"
  WHERE "isActive" = true AND "stock" > 0 AND "spinCutout" = true AND cardinality("spinFrames") > 0
  ORDER BY "isFeatured" DESC, "createdAt" DESC
  LIMIT 6
);
