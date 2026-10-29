-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'REVIEW', 'PAID', 'REJECTED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "receiptAt" TIMESTAMP(3),
ADD COLUMN     "receiptFileId" TEXT,
ADD COLUMN     "receiptMime" TEXT;

-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "cardHolder" TEXT,
ADD COLUMN     "cardNumber" TEXT,
ADD COLUMN     "paymentQr" TEXT;

