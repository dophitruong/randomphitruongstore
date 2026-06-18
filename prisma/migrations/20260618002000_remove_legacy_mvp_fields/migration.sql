-- Phase 5.3 Step 28: remove legacy MVP compatibility fields after app migration.
-- This is intentionally a new migration; do not edit merged migrations.

-- Final safety backfills before enforcing required ERD fields.
UPDATE "Product"
SET "basePrice" = "price"
WHERE "basePrice" IS NULL;

UPDATE "Product"
SET "categoryId" = CASE "category"
    WHEN 'SUKAJAN'::"ProductCategory" THEN '5b2d9f8a-9b6e-4f4c-8c0d-0f0f0f0f0a01'::uuid
    WHEN 'BOMBER'::"ProductCategory" THEN '5b2d9f8a-9b6e-4f4c-8c0d-0f0f0f0f0a02'::uuid
    WHEN 'HOODIE'::"ProductCategory" THEN '5b2d9f8a-9b6e-4f4c-8c0d-0f0f0f0f0a03'::uuid
    WHEN 'JACKET'::"ProductCategory" THEN '5b2d9f8a-9b6e-4f4c-8c0d-0f0f0f0f0a04'::uuid
    WHEN 'SEASONAL'::"ProductCategory" THEN '5b2d9f8a-9b6e-4f4c-8c0d-0f0f0f0f0a05'::uuid
  END
WHERE "categoryId" IS NULL;

UPDATE "Order"
SET "subtotalAmount" = "subtotal"
WHERE "subtotalAmount" IS NULL;

UPDATE "Order"
SET "totalAmount" = COALESCE("totalAmount", "subtotalAmount" + "shippingFee")
WHERE "totalAmount" IS NULL;

UPDATE "Order"
SET "remainingAmount" = COALESCE(
  "remainingAmount",
  CASE
    WHEN "paymentOption" = 'DEPOSIT_50'::"PaymentOption"
      THEN "totalAmount" - COALESCE("depositAmount", 0)
    ELSE 0
  END
)
WHERE "remainingAmount" IS NULL;

-- Align Product.categoryId with the now-required relation.
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";

DROP INDEX IF EXISTS "Product_category_isActive_idx";
CREATE INDEX IF NOT EXISTS "Product_categoryId_isActive_idx" ON "Product"("categoryId", "isActive");

ALTER TABLE "Product"
  ALTER COLUMN "categoryId" SET NOT NULL,
  ALTER COLUMN "basePrice" SET NOT NULL,
  DROP COLUMN "category",
  DROP COLUMN "price",
  DROP COLUMN "sizes",
  DROP COLUMN "colors";

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Customer"
  DROP COLUMN "address",
  DROP COLUMN "province",
  DROP COLUMN "district",
  DROP COLUMN "ward";

ALTER TABLE "Order"
  ALTER COLUMN "subtotalAmount" SET NOT NULL,
  ALTER COLUMN "remainingAmount" SET NOT NULL,
  ALTER COLUMN "totalAmount" SET NOT NULL,
  DROP COLUMN "subtotal",
  DROP COLUMN "depositAmount";

DROP TABLE "OrderRequest";

DROP TYPE "OrderRequestStatus";
DROP TYPE "ProductCategory";
