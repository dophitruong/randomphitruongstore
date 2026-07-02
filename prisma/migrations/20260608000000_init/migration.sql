-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "ShippingRegion" AS ENUM ('VIETNAM', 'KOREA', 'TAIWAN', 'JAPAN');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('DEPOSIT_50_BANK_ZALO', 'ONLINE_100_VNPAY', 'ONLINE_100_MOMO', 'ONLINE_100_SEPAY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_DEPOSIT', 'DEPOSIT_CONFIRMED', 'PENDING_ONLINE_PAYMENT', 'PAID_FULL', 'ORDERED_FROM_SUPPLIER', 'ARRIVED_AT_SHOP', 'SHIPPING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('VND', 'USD');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'CONVERTED_TO_ORDER', 'CLOSED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('CATALOG_PRODUCT', 'CUSTOM_INQUIRY');

-- CreateEnum
CREATE TYPE "PaymentOption" AS ENUM ('DEPOSIT_50', 'ONLINE_100');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'REMAINING_BALANCE', 'FULL_PAYMENT', 'SHIPPING_FEE');

-- CreateEnum
CREATE TYPE "ProofStatus" AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'READY_TO_SHIP', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('ABOUT', 'CONTACT', 'FAQ', 'ORDER_GUIDE', 'PAYMENT_GUIDE', 'SHIPPING_GUIDE', 'CUSTOM_PAGE');

-- CreateEnum
CREATE TYPE "SourceChannel" AS ENUM ('WEBSITE', 'ZALO', 'INSTAGRAM', 'TIKTOK', 'OTHER');

-- CreateEnum
CREATE TYPE "CustomsIdType" AS ENUM ('RESIDENCE_CARD', 'PASSPORT', 'VIRTUAL_ID', 'NONE');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" UUID NOT NULL,
    "adminUserId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadIntent" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSetting" (
    "id" UUID NOT NULL,
    "brandName" TEXT NOT NULL,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'vi',
    "defaultCurrency" "Currency" NOT NULL DEFAULT 'VND',
    "vndEnabled" BOOLEAN NOT NULL DEFAULT true,
    "usdEnabled" BOOLEAN NOT NULL DEFAULT true,
    "vndPerUsd" DECIMAL(12,4) DEFAULT 25000,
    "exchangeRateUpdatedAt" TIMESTAMP(3),
    "zaloPhone" TEXT NOT NULL,
    "zaloQrCodeUrl" TEXT,
    "orderLeadTimeText" TEXT NOT NULL DEFAULT '7-10 ngày',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" UUID NOT NULL,
    "shopSettingId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" UUID NOT NULL,
    "shopSettingId" UUID NOT NULL,
    "bankName" TEXT NOT NULL,
    "branchName" TEXT,
    "accountNumber" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "vietqrImageUrl" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZaloCommunity" (
    "id" UUID NOT NULL,
    "shopSettingId" UUID NOT NULL,
    "groupName" TEXT NOT NULL,
    "groupUrl" TEXT,
    "qrCodeUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZaloCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "parentCategoryId" UUID,
    "nameVi" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descriptionVi" TEXT,
    "descriptionEn" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "nameVi" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descriptionVi" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdByAdminId" UUID,
    "basePrice" INTEGER NOT NULL,
    "orderLeadTimeMinDays" INTEGER NOT NULL DEFAULT 7,
    "orderLeadTimeMaxDays" INTEGER NOT NULL DEFAULT 10,
    "materialVi" TEXT NOT NULL,
    "materialEn" TEXT NOT NULL,
    "stockStatus" "StockStatus" NOT NULL DEFAULT 'IN_STOCK',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "altVi" TEXT NOT NULL,
    "altEn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "productId" UUID NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "size" TEXT NOT NULL,
    "colorVi" TEXT NOT NULL,
    "colorEn" TEXT NOT NULL,
    "priceAdjustment" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeChart" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "size" TEXT NOT NULL,
    "shoulder" DECIMAL(6,2),
    "chest" DECIMAL(6,2),
    "length" DECIMAL(6,2),
    "sleeve" DECIMAL(6,2),
    "unit" TEXT NOT NULL DEFAULT 'cm',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SizeChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "supabaseUserId" TEXT,
    "zaloPhone" TEXT,
    "instagramHandle" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'vi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" UUID NOT NULL,
    "customerId" UUID,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "channel" "SourceChannel" NOT NULL DEFAULT 'WEBSITE',
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInquiry" (
    "id" UUID NOT NULL,
    "customerId" UUID,
    "productId" UUID,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "zaloPhone" TEXT,
    "instagramHandle" TEXT,
    "sourceChannel" "SourceChannel" NOT NULL DEFAULT 'WEBSITE',
    "externalProductUrl" TEXT,
    "customerMessage" TEXT,
    "preferredSize" TEXT,
    "preferredColor" TEXT,
    "quotedPrice" INTEGER,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "quotedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryImage" (
    "id" UUID NOT NULL,
    "inquiryId" UUID NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "originalFilename" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "inquiryId" UUID,
    "updatedByAdminId" UUID,
    "trackingToken" TEXT,
    "orderType" "OrderType" NOT NULL DEFAULT 'CATALOG_PRODUCT',
    "paymentOption" "PaymentOption",
    "shippingRegion" "ShippingRegion" NOT NULL DEFAULT 'VIETNAM',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "subtotalAmount" INTEGER NOT NULL,
    "remainingAmount" INTEGER NOT NULL,
    "shippingFee" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "displayCurrency" "Currency" NOT NULL DEFAULT 'VND',
    "exchangeRateVndPerUsd" DECIMAL(12,4),
    "sizeColorLocked" BOOLEAN NOT NULL DEFAULT false,
    "noChangePolicyAck" BOOLEAN NOT NULL DEFAULT false,
    "noChangePolicyAckAt" TIMESTAMP(3),
    "expectedArrivalDate" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingAddress" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Vietnam',
    "provinceCity" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "fullAddress" TEXT,
    "isInternational" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID,
    "productVariantId" UUID,
    "productName" TEXT NOT NULL,
    "itemNameSnapshot" TEXT,
    "unitPrice" INTEGER NOT NULL,
    "lineTotal" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "size" TEXT NOT NULL,
    "selectedSize" TEXT,
    "color" TEXT NOT NULL,
    "selectedColor" TEXT,
    "itemNotes" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "bankAccountId" UUID,
    "paymentType" "PaymentType" NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "transactionReference" TEXT,
    "gatewayProvider" TEXT,
    "gatewayTransactionId" TEXT,
    "gatewayOrderId" TEXT,
    "gatewayResponse" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentProof" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "proofImageUrl" TEXT NOT NULL,
    "submittedVia" TEXT,
    "verificationStatus" "ProofStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "createdByAdminId" UUID,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "carrierName" TEXT,
    "trackingCode" TEXT,
    "shipmentStatus" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternationalCountry" (
    "countryCode" TEXT NOT NULL,
    "countryNameVi" TEXT NOT NULL,
    "countryNameEn" TEXT NOT NULL,
    "requiredCustomsInfo" TEXT NOT NULL,
    "supportsVirtualId" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InternationalCountry_pkey" PRIMARY KEY ("countryCode")
);

-- CreateTable
CREATE TABLE "InternationalShippingDetail" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "countryCode" TEXT NOT NULL,
    "customsIdType" "CustomsIdType",
    "usesVirtualId" BOOLEAN NOT NULL DEFAULT false,
    "noInsuranceAck" BOOLEAN NOT NULL DEFAULT false,
    "warehouseShippingFee" INTEGER,
    "consultationChannel" "SourceChannel",
    "customsNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternationalShippingDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_role_isActive_idx" ON "AdminUser"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_adminUserId_revokedAt_expiresAt_idx" ON "AdminSession"("adminUserId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitBucket_key_key" ON "RateLimitBucket"("key");

-- CreateIndex
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

-- CreateIndex
CREATE UNIQUE INDEX "UploadIntent_tokenHash_key" ON "UploadIntent"("tokenHash");

-- CreateIndex
CREATE INDEX "UploadIntent_expiresAt_usedAt_idx" ON "UploadIntent"("expiresAt", "usedAt");

-- CreateIndex
CREATE INDEX "SocialLink_shopSettingId_idx" ON "SocialLink"("shopSettingId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_shopSettingId_platform_key" ON "SocialLink"("shopSettingId", "platform");

-- CreateIndex
CREATE INDEX "BankAccount_shopSettingId_isDefault_idx" ON "BankAccount"("shopSettingId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_shopSettingId_accountNumber_key" ON "BankAccount"("shopSettingId", "accountNumber");

-- CreateIndex
CREATE INDEX "ZaloCommunity_shopSettingId_idx" ON "ZaloCommunity"("shopSettingId");

-- CreateIndex
CREATE UNIQUE INDEX "ZaloCommunity_shopSettingId_groupName_key" ON "ZaloCommunity"("shopSettingId", "groupName");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentCategoryId_idx" ON "Category"("parentCategoryId");

-- CreateIndex
CREATE INDEX "Category_isActive_sortOrder_idx" ON "Category"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_isActive_idx" ON "Product"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_createdByAdminId_idx" ON "Product"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Product_stockStatus_idx" ON "Product"("stockStatus");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_size_colorVi_key" ON "ProductVariant"("productId", "size", "colorVi");

-- CreateIndex
CREATE INDEX "SizeChart_productId_idx" ON "SizeChart"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "SizeChart_productId_size_key" ON "SizeChart"("productId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_supabaseUserId_key" ON "Customer"("supabaseUserId");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "ContactSubmission_customerId_idx" ON "ContactSubmission"("customerId");

-- CreateIndex
CREATE INDEX "ContactSubmission_status_createdAt_idx" ON "ContactSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ProductInquiry_customerId_idx" ON "ProductInquiry"("customerId");

-- CreateIndex
CREATE INDEX "ProductInquiry_productId_idx" ON "ProductInquiry"("productId");

-- CreateIndex
CREATE INDEX "ProductInquiry_status_createdAt_idx" ON "ProductInquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "InquiryImage_inquiryId_sortOrder_idx" ON "InquiryImage"("inquiryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_inquiryId_key" ON "Order"("inquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_trackingToken_key" ON "Order"("trackingToken");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_updatedByAdminId_idx" ON "Order"("updatedByAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingAddress_orderId_key" ON "ShippingAddress"("orderId");

-- CreateIndex
CREATE INDEX "ShippingAddress_orderId_idx" ON "ShippingAddress"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_productVariantId_idx" ON "OrderItem"("productVariantId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_bankAccountId_idx" ON "Payment"("bankAccountId");

-- CreateIndex
CREATE INDEX "Payment_paymentStatus_createdAt_idx" ON "Payment"("paymentStatus", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gatewayProvider_gatewayTransactionId_key" ON "Payment"("gatewayProvider", "gatewayTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gatewayProvider_gatewayOrderId_key" ON "Payment"("gatewayProvider", "gatewayOrderId");

-- CreateIndex
CREATE INDEX "PaymentProof_paymentId_idx" ON "PaymentProof"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentProof_verificationStatus_submittedAt_idx" ON "PaymentProof"("verificationStatus", "submittedAt");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_createdByAdminId_idx" ON "OrderStatusHistory"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Shipment_orderId_idx" ON "Shipment"("orderId");

-- CreateIndex
CREATE INDEX "Shipment_shipmentStatus_idx" ON "Shipment"("shipmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "InternationalShippingDetail_orderId_key" ON "InternationalShippingDetail"("orderId");

-- CreateIndex
CREATE INDEX "InternationalShippingDetail_countryCode_idx" ON "InternationalShippingDetail"("countryCode");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_shopSettingId_fkey" FOREIGN KEY ("shopSettingId") REFERENCES "ShopSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_shopSettingId_fkey" FOREIGN KEY ("shopSettingId") REFERENCES "ShopSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZaloCommunity" ADD CONSTRAINT "ZaloCommunity_shopSettingId_fkey" FOREIGN KEY ("shopSettingId") REFERENCES "ShopSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeChart" ADD CONSTRAINT "SizeChart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactSubmission" ADD CONSTRAINT "ContactSubmission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInquiry" ADD CONSTRAINT "ProductInquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInquiry" ADD CONSTRAINT "ProductInquiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryImage" ADD CONSTRAINT "InquiryImage_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "ProductInquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "ProductInquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedByAdminId_fkey" FOREIGN KEY ("updatedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingAddress" ADD CONSTRAINT "ShippingAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternationalShippingDetail" ADD CONSTRAINT "InternationalShippingDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternationalShippingDetail" ADD CONSTRAINT "InternationalShippingDetail_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "InternationalCountry"("countryCode") ON DELETE RESTRICT ON UPDATE CASCADE;

