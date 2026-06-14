CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK');

ALTER TABLE "Product"
ADD COLUMN "stockStatus" "StockStatus" NOT NULL DEFAULT 'IN_STOCK';

CREATE INDEX "Product_stockStatus_idx" ON "Product"("stockStatus");
