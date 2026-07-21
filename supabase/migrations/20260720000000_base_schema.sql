CREATE TABLE "Branch" (
  "id" SERIAL PRIMARY KEY,
  "number" TEXT NOT NULL UNIQUE,
  "nameAr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "addressAr" TEXT NOT NULL,
  "addressEn" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "mapsUrl" TEXT NOT NULL,
  "hoursAr" TEXT NOT NULL DEFAULT '',
  "hoursEn" TEXT NOT NULL DEFAULT '',
  "landmarksAr" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "landmarksEn" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Category" (
  "id" SERIAL PRIMARY KEY,
  "nameAr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "MenuItem" (
  "id" SERIAL PRIMARY KEY,
  "categoryId" INTEGER NOT NULL,
  "nameAr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "descAr" TEXT NOT NULL,
  "descEn" TEXT NOT NULL,
  "price" INTEGER,
  "sizes" JSONB,
  "image" TEXT NOT NULL,
  "badge" TEXT,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MenuItem_categoryId_idx" ON "MenuItem"("categoryId");

CREATE TABLE "Review" (
  "id" SERIAL PRIMARY KEY,
  "branchId" INTEGER,
  "name" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Admin" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'editor',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "RestaurantTable" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "branchId" INTEGER NOT NULL,
  "tableNumber" INTEGER NOT NULL,
  "qrToken" TEXT NOT NULL UNIQUE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "RestaurantTable_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "RestaurantTable_branchId_tableNumber_key" UNIQUE ("branchId", "tableNumber")
);

CREATE INDEX "RestaurantTable_branchId_idx" ON "RestaurantTable"("branchId");

CREATE TABLE "Order" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tableId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedAt" TIMESTAMPTZ(6),
  "servedAt" TIMESTAMPTZ(6),
  CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RestaurantTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Order_tableId_idx" ON "Order"("tableId");
CREATE INDEX "Order_status_idx" ON "Order"("status");

CREATE TABLE "OrderItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL,
  "menuItemId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "selectedSize" JSONB,
  "notes" TEXT,
  "presets" JSONB,
  "priceAtOrder" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

CREATE TABLE "SystemSetting" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL UNIQUE,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL
);

CREATE TABLE "SiteContent" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL UNIQUE,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL
);
