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

-- Preserve legacy custom request rows before removing the old mirror table.
-- Existing mirrored ProductInquiry rows are detected by their request snapshot
-- fields so this only creates missing inquiries for pre-migration rows.
INSERT INTO "ProductInquiry" (
  "id",
  "customerId",
  "productId",
  "fullName",
  "phone",
  "email",
  "zaloPhone",
  "instagramHandle",
  "sourceChannel",
  "externalProductUrl",
  "customerMessage",
  "preferredSize",
  "preferredColor",
  "quotedPrice",
  "status",
  "quotedAt",
  "createdAt"
)
SELECT
  request."id",
  NULL,
  NULL,
  request."fullName",
  request."phone",
  NULL,
  NULL,
  request."socialContact",
  'WEBSITE'::"SourceChannel",
  request."inspirationUrl",
  request."note",
  request."desiredSize",
  request."desiredColor",
  NULL,
  request."status"::text::"InquiryStatus",
  CASE
    WHEN request."status" = 'QUOTED'::"OrderRequestStatus"
      THEN request."updatedAt"
    ELSE NULL
  END,
  request."createdAt"
FROM "OrderRequest" AS request
WHERE NOT EXISTS (
  SELECT 1
  FROM "ProductInquiry" AS inquiry
  WHERE inquiry."fullName" = request."fullName"
    AND inquiry."phone" = request."phone"
    AND inquiry."externalProductUrl" = request."inspirationUrl"
    AND inquiry."preferredSize" = request."desiredSize"
    AND inquiry."preferredColor" = request."desiredColor"
    AND inquiry."customerMessage" IS NOT DISTINCT FROM request."note"
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "InquiryImage" (
  "id",
  "inquiryId",
  "imageUrl",
  "originalFilename",
  "sortOrder",
  "createdAt"
)
SELECT
  gen_random_uuid(),
  inquiry."id",
  request."inspirationUrl",
  NULL,
  0,
  request."createdAt"
FROM "OrderRequest" AS request
JOIN LATERAL (
  SELECT candidate."id"
  FROM "ProductInquiry" AS candidate
  WHERE candidate."fullName" = request."fullName"
    AND candidate."phone" = request."phone"
    AND candidate."externalProductUrl" = request."inspirationUrl"
    AND candidate."preferredSize" = request."desiredSize"
    AND candidate."preferredColor" = request."desiredColor"
    AND candidate."customerMessage" IS NOT DISTINCT FROM request."note"
  ORDER BY
    CASE WHEN candidate."id" = request."id" THEN 0 ELSE 1 END,
    candidate."createdAt"
  LIMIT 1
) AS inquiry ON TRUE
LEFT JOIN "InquiryImage" AS image
  ON image."inquiryId" = inquiry."id"
  AND image."imageUrl" = request."inspirationUrl"
WHERE image."id" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "OrderRequest" AS request
    WHERE NOT EXISTS (
      SELECT 1
      FROM "ProductInquiry" AS inquiry
      WHERE inquiry."fullName" = request."fullName"
        AND inquiry."phone" = request."phone"
        AND inquiry."externalProductUrl" = request."inspirationUrl"
        AND inquiry."preferredSize" = request."desiredSize"
        AND inquiry."preferredColor" = request."desiredColor"
        AND inquiry."customerMessage" IS NOT DISTINCT FROM request."note"
        AND EXISTS (
          SELECT 1
          FROM "InquiryImage" AS image
          WHERE image."inquiryId" = inquiry."id"
            AND image."imageUrl" = request."inspirationUrl"
        )
    )
  ) THEN
    RAISE EXCEPTION
      'Cannot drop OrderRequest: legacy rows were not backfilled to ProductInquiry';
  END IF;
END
$$;

-- Preserve legacy order delivery snapshots before removing Customer address
-- columns. Newer orders already have ShippingAddress rows and are skipped.
INSERT INTO "ShippingAddress" (
  "id",
  "orderId",
  "recipientName",
  "phone",
  "country",
  "provinceCity",
  "district",
  "ward",
  "streetAddress",
  "fullAddress",
  "isInternational",
  "createdAt"
)
SELECT
  gen_random_uuid(),
  orders."id",
  customer."fullName",
  customer."phone",
  CASE orders."shippingRegion"
    WHEN 'KOREA'::"ShippingRegion" THEN 'South Korea'
    WHEN 'TAIWAN'::"ShippingRegion" THEN 'Taiwan'
    WHEN 'JAPAN'::"ShippingRegion" THEN 'Japan'
    ELSE 'Vietnam'
  END,
  customer."province",
  customer."district",
  customer."ward",
  customer."address",
  concat_ws(
    ', ',
    NULLIF(customer."address", ''),
    NULLIF(customer."ward", ''),
    NULLIF(customer."district", ''),
    NULLIF(customer."province", ''),
    CASE orders."shippingRegion"
      WHEN 'KOREA'::"ShippingRegion" THEN 'South Korea'
      WHEN 'TAIWAN'::"ShippingRegion" THEN 'Taiwan'
      WHEN 'JAPAN'::"ShippingRegion" THEN 'Japan'
      ELSE 'Vietnam'
    END
  ),
  orders."shippingRegion" <> 'VIETNAM'::"ShippingRegion",
  orders."createdAt"
FROM "Order" AS orders
JOIN "Customer" AS customer
  ON customer."id" = orders."customerId"
LEFT JOIN "ShippingAddress" AS address
  ON address."orderId" = orders."id"
WHERE address."id" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Order" AS orders
    LEFT JOIN "ShippingAddress" AS address
      ON address."orderId" = orders."id"
    WHERE address."id" IS NULL
  ) THEN
    RAISE EXCEPTION
      'Cannot drop Customer address fields: existing orders still lack ShippingAddress rows';
  END IF;
END
$$;

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
