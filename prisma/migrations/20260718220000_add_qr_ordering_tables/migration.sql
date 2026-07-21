CREATE TABLE "RestaurantTable" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branchId" INTEGER NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "qrToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantTable_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RestaurantTable_qrToken_key" UNIQUE ("qrToken"),
    CONSTRAINT "RestaurantTable_branchId_tableNumber_key" UNIQUE ("branchId", "tableNumber")
);

CREATE TABLE "Order" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tableId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMPTZ(6),
    "servedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "selectedSize" JSONB,
    "notes" TEXT,
    "presets" JSONB,
    "priceAtOrder" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SystemSetting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SystemSetting_key_key" UNIQUE ("key")
);

ALTER TABLE "RestaurantTable" ADD CONSTRAINT "RestaurantTable_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RestaurantTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "RestaurantTable_branchId_idx" ON "RestaurantTable"("branchId");

CREATE INDEX "Order_tableId_idx" ON "Order"("tableId");

CREATE INDEX "Order_status_idx" ON "Order"("status");

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

INSERT INTO "SystemSetting" ("id", "key", "value") VALUES
  (gen_random_uuid(), 'order_history_ttl_hours', '4'),
  (gen_random_uuid(), 'customer_live_tracking', 'false'),
  (gen_random_uuid(), 'staff_sound_alerts', 'false');
