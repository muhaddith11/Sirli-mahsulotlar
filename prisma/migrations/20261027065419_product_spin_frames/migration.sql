-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "spinCutout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spinFrames" TEXT[] DEFAULT ARRAY[]::TEXT[];
