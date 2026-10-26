-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "nameRu" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'uz';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionRu" TEXT,
ADD COLUMN     "nameRu" TEXT;
