CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "Product"
ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'PUBLISHED';

CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_status_isActive_idx" ON "Product"("status", "isActive");
