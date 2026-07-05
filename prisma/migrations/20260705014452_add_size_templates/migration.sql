-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sizeTemplateId" UUID;

-- AlterTable
ALTER TABLE "SizeChart" ADD COLUMN     "measurements" JSONB;

-- CreateTable
CREATE TABLE "SizeTemplate" (
    "id" UUID NOT NULL,
    "nameVi" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SizeTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sizeTemplateId_fkey" FOREIGN KEY ("sizeTemplateId") REFERENCES "SizeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
